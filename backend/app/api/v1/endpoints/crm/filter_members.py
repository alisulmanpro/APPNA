from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.committee import CommitteeMember
from app.schemas.user import MemberResponse

router = APIRouter()


@router.get(
    "/members/filter",
    summary="Filter members by committee, location or role",
)
async def filter_members(
        role: UserRole | None = Query(default=None, description="Filter by role"),
        location: str | None = Query(default=None, description="Filter by location"),
        committee_id: UUID | None = Query(default=None, description="Filter by committee"),
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    # ── Base query ────────────────────────────────────
    query = select(User).where(User.is_active == True)

    # ── Apply filters ─────────────────────────────────
    if role:
        query = query.where(User.role == role)

    if location:
        query = query.where(User.location.ilike(f"%{location}%"))

    if committee_id:
        query = query.join(
            CommitteeMember,
            CommitteeMember.user_id == User.id
        ).where(
            CommitteeMember.committee_id == committee_id
        )

    # ── Fetch results ─────────────────────────────────
    result = await db.execute(
        query.order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    members = result.scalars().all()

    return {
        "filters": {
            "role": role,
            "location": location,
            "committee_id": str(committee_id) if committee_id else None,
        },
        "count": len(members),
        "data": [MemberResponse.model_validate(m) for m in members],
        "pagination": {
            "page": page,
            "limit": limit,
            "has_next": len(members) == limit,
            "has_prev": page > 1,
        }
    }
