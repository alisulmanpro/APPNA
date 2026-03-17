from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import MemberResponse

router = APIRouter()


@router.get(
    "/members",
    summary="List all members (paginated)",
)
async def list_members(
        page: int = Query(default=1, ge=1, description="Page number"),
        limit: int = Query(default=10, ge=1, le=100, description="Items per page"),
        include_inactive: bool = Query(default=False, description="Include deactivated members"),
        db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    # ── Base query ────────────────────────────────────
    query = select(User)
    count_query = select(func.count(User.id))

    if not include_inactive:
        query = query.where(User.is_active == True)
        count_query = count_query.where(User.is_active == True)

    # ── Total count ───────────────────────────────────
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # ── Fetch page ────────────────────────────────────
    result = await db.execute(
        query.order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    members = result.scalars().all()

    return {
        "data": [MemberResponse.model_validate(m) for m in members],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
            "has_next": page * limit < total,
            "has_prev": page > 1,
        }
    }
