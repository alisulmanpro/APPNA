from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import MemberResponse

router = APIRouter()


@router.get(
    "/members/search",
    summary="Search members",
)
async def search_members(
        q: str = Query(min_length=1, description="Search by name, email or location"),
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    search_term = f"%{q.lower()}%"

    # ── Search across multiple fields ─────────────────
    query = select(User).where(
        User.is_active == True,
        or_(
            User.first_name.ilike(search_term),
            User.last_name.ilike(search_term),
            User.email.ilike(search_term),
            User.location.ilike(search_term),
        )
    )

    result = await db.execute(
        query.order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    members = result.scalars().all()

    return {
        "query": q,
        "count": len(members),
        "data": [MemberResponse.model_validate(m) for m in members],
        "pagination": {
            "page": page,
            "limit": limit,
            "has_next": len(members) == limit,
            "has_prev": page > 1,
        }
    }
