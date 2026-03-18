import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.meeting import Meeting, MeetingStatus

router = APIRouter()


class MinutesPayload(BaseModel):
    minutes: str


@router.patch(
    "/meetings/{meeting_id}/minutes",
    status_code=status.HTTP_200_OK,
    summary="Save meeting minutes",
)
async def save_minutes(
        meeting_id: uuid.UUID,
        payload: MinutesPayload,
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

    # ── Cannot save minutes for cancelled meeting ─────
    if meeting.status == MeetingStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot save minutes for a cancelled meeting.",
        )

    # ── Cannot save minutes before transcript ─────────
    if not meeting.transcript:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcript must be stored before saving minutes.",
        )

    # ── Track if overwriting ──────────────────────────
    is_update = meeting.minutes is not None

    # ── Save minutes ──────────────────────────────────
    meeting.minutes = payload.minutes

    await db.commit()
    await db.refresh(meeting)

    return {
        "message": "Meeting minutes saved successfully.",
        "meeting_id": str(meeting_id),
        "meeting_title": meeting.title,
        "minutes_length": len(payload.minutes),
        "is_update": is_update,
        "has_transcript": True,
        "has_ai_summary": meeting.ai_summary is not None,
    }
