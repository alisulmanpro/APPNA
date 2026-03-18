from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.committee import Committee
from app.schemas.committee import CommitteeResponse

router = APIRouter()


@router.get(
    "/committees",
    summary="List all committees (paginated)",
)
async def list_committees(
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, ge=1, le=100),
        include_inactive: bool = Query(default=False, description="Include deactivated committees"),
        db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    # ── Base query ────────────────────────────────────
    query = select(Committee)
    count_query = select(func.count(Committee.id))

    if not include_inactive:
        query = query.where(Committee.is_active == True)
        count_query = count_query.where(Committee.is_active == True)

    # ── Total count ───────────────────────────────────
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # ── Fetch page ────────────────────────────────────
    result = await db.execute(
        query.order_by(Committee.created_at.desc()).offset(offset).limit(limit)
    )
    committees = result.scalars().all()

    return {
        "data": [CommitteeResponse.model_validate(c) for c in committees],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
            "has_next": page * limit < total,
            "has_prev": page > 1,
        }
    }
