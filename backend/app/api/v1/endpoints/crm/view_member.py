import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import MemberResponse

router = APIRouter()


@router.get(
    "/members/{member_id}",
    response_model=MemberResponse,
    summary="View member profile",
)
async def view_member(
        member_id: uuid.UUID,
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

    if not member.is_active:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail=f"Member with id '{member_id}' has been deactivated.",
        )

    return member
