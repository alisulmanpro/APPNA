from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.meeting import Meeting
from app.models.committee import Committee
from app.schemas.meeting import MeetingCreate, MeetingResponse

router = APIRouter()


@router.post(
    "/meetings",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule a new meeting",
)
async def schedule_meeting(
        payload: MeetingCreate,
        db: AsyncSession = Depends(get_db),
):
    # ── Validate scheduled time is in future ──────────
    if payload.scheduled_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Meeting must be scheduled in the future.",
        )

    # ── Validate committee if provided ────────────────
    if payload.committee_id:
        committee_result = await db.execute(
            select(Committee).where(
                Committee.id == payload.committee_id,
                Committee.is_active == True,
            )
        )
        if not committee_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Committee with id '{payload.committee_id}' not found.",
            )

    # ── Create meeting ────────────────────────────────
    meeting = Meeting(
        title=payload.title,
        description=payload.description,
        location=payload.location,
        scheduled_at=payload.scheduled_at,
        duration_minutes=payload.duration_minutes,
        committee_id=payload.committee_id,
        scheduled_by_id=payload.scheduled_by_id,
    )

    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)

    return meeting
