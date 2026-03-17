import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import MemberResponse
from app.schemas.user import MemberUpdate

router = APIRouter()


@router.patch(
    "/members/{member_id}",
    response_model=MemberResponse,
    summary="Update member information",
)
async def update_member(
        member_id: uuid.UUID,
        payload: MemberUpdate,
        db: AsyncSession = Depends(get_db),
):
    # ── Fetch member ──────────────────────────────────
    result = await db.execute(select(User).where(User.id == member_id))
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with id '{member_id}' not found.",
        )

    # ── Check email uniqueness if email is changing ───
    if payload.email and payload.email != member.email:
        existing = await db.execute(
            select(User).where(User.email == payload.email)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{payload.email}' is already in use.",
            )

    # ── Apply only provided fields ────────────────────
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)

    await db.commit()
    await db.refresh(member)

    return member
