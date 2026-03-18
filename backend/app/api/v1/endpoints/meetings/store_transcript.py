import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.meeting import Meeting, MeetingStatus

router = APIRouter()


class TranscriptPayload(BaseModel):
    transcript: str


@router.patch(
    "/meetings/{meeting_id}/transcript",
    status_code=status.HTTP_200_OK,
    summary="Store meeting transcript",
)
async def store_transcript(
        meeting_id: uuid.UUID,
        payload: TranscriptPayload,
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

    # ── Cannot store transcript for cancelled meeting ──
    if meeting.status == MeetingStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot store transcript for a cancelled meeting.",
        )

    # ── Warn if overwriting existing transcript ────────
    is_update = meeting.transcript is not None

    # ── Store transcript ──────────────────────────────
    meeting.transcript = payload.transcript
    meeting.status = MeetingStatus.completed

    await db.commit()
    await db.refresh(meeting)

    return {
        "message": "Transcript stored successfully.",
        "meeting_id": str(meeting_id),
        "meeting_title": meeting.title,
        "status": meeting.status,
        "transcript_length": len(payload.transcript),
        "is_update": is_update,
        "ai_summary_ready": False,
        "hint": "Trigger POST /meetings/{id}/summarize to generate AI summary.",
    }
