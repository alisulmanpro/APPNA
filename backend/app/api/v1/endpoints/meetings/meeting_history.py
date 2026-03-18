import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.core.database import get_db
from app.models.meeting import Meeting, MeetingStatus
from app.schemas.meeting import MeetingResponse

router = APIRouter()


@router.get(
    "/meetings",
    summary="Meeting history",
)
async def meeting_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    status: MeetingStatus | None = Query(default=None, description="Filter by status"),
    committee_id: uuid.UUID | None = Query(default=None, description="Filter by committee"),
    from_date: datetime | None = Query(default=None, description="Filter from date"),
    to_date: datetime | None = Query(default=None, description="Filter to date"),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    # ── Base query ────────────────────────────────────
    query = select(Meeting)

    # ── Apply filters ─────────────────────────────────
    if status:
        query = query.where(Meeting.status == status)

    if committee_id:
        query = query.where(Meeting.committee_id == committee_id)

    if from_date:
        query = query.where(Meeting.scheduled_at >= from_date)

    if to_date:
        query = query.where(Meeting.scheduled_at <= to_date)

    # ── Fetch results ─────────────────────────────────
    result = await db.execute(
        query.order_by(Meeting.scheduled_at.desc()).offset(offset).limit(limit)
    )
    meetings = result.scalars().all()

    return {
        "filters": {
            "status": status,
            "committee_id": str(committee_id) if committee_id else None,
            "from_date": from_date,
            "to_date": to_date,
        },
        "count": len(meetings),
        "data": [MeetingResponse.model_validate(m) for m in meetings],
        "pagination": {
            "page": page,
            "limit": limit,
            "has_next": len(meetings) == limit,
            "has_prev": page > 1,
        }
    }