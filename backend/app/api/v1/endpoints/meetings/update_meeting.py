import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.meeting import Meeting, MeetingStatus
from app.models.committee import Committee
from app.schemas.meeting import MeetingResponse, MeetingUpdate

router = APIRouter()


@router.patch(
    "/meetings/{meeting_id}",
    response_model=MeetingResponse,
    summary="Update meeting details",
)
async def update_meeting(
        meeting_id: uuid.UUID,
        payload: MeetingUpdate,
        db: AsyncSession = Depends(get_db),
):
    # ── Fetch meeting ─────────────────────────────────
    result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id)
    )
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with id '{meeting_id}' not found.",
        )

    # ── Cannot update cancelled meeting ───────────────
    if meeting.status == MeetingStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update a cancelled meeting.",
        )

    # ── Cannot update completed meeting ───────────────
    if meeting.status == MeetingStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update a completed meeting.",
        )

    # ── Validate scheduled time if changing ───────────
    if payload.scheduled_at:
        if payload.scheduled_at <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Meeting must be scheduled in the future.",
            )

    # ── Validate committee if changing ────────────────
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

    # ── Apply only provided fields ────────────────────
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(meeting, field, value)

    await db.commit()
    await db.refresh(meeting)

    return meeting
