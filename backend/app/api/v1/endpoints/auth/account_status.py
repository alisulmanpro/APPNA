import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User

router = APIRouter()


class AccountStatusResponse(BaseModel):
    message: str
    user_id: str
    email: str
    is_active: bool


# ── Deactivate account ─────────────────────────────────
@router.patch(
    "/auth/accounts/{user_id}/deactivate",
    response_model=AccountStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Deactivate a user account — Admin only",
)
async def deactivate_account(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # ── Fetch user ─────────────────────────────────────
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found.",
        )

    # ── Cannot deactivate yourself ─────────────────────
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )

    # ── Already deactivated ────────────────────────────
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Account '{user.email}' is already deactivated.",
        )

    # ── Cannot deactivate president ────────────────────
    if user.role.value == "president":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="President account cannot be deactivated.",
        )

    # ── Deactivate ─────────────────────────────────────
    user.is_active = False

    await db.commit()

    return AccountStatusResponse(
        message=f"Account '{user.email}' has been deactivated.",
        user_id=str(user.id),
        email=user.email,
        is_active=False,
    )


# ── Activate account ───────────────────────────────────
@router.patch(
    "/auth/accounts/{user_id}/activate",
    response_model=AccountStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Activate a user account — Admin only",
)
async def activate_account(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # ── Fetch user ─────────────────────────────────────
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found.",
        )

    # ── Already active ─────────────────────────────────
    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Account '{user.email}' is already active.",
        )

    # ── Activate ───────────────────────────────────────
    user.is_active = True

    await db.commit()

    return AccountStatusResponse(
        message=f"Account '{user.email}' has been activated.",
        user_id=str(user.id),
        email=user.email,
        is_active=True,
    )