import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User

router = APIRouter()


@router.delete(
    "/members/{member_id}",
    status_code=status.HTTP_200_OK,
    summary="Soft delete a member",
)
async def delete_member(
        member_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(require_admin), 
):
    # ── Fetch member ──────────────────────────────────
    result = await db.execute(select(User).where(User.id == member_id))
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with id '{member_id}' not found.",
        )

    # ── Already deactivated ───────────────────────────
    if not member.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Member with id '{member_id}' is already deactivated.",
        )

    # ── Soft delete — just flip is_active ─────────────
    member.is_active = False

    await db.commit()

    return {
        "message": f"Member '{member.first_name} {member.last_name}' has been deactivated.",
        "member_id": str(member_id),
        "is_active": False,
    }
