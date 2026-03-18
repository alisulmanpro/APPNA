import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.meeting import Meeting, MeetingStatus
from app.schemas.meeting import CancelMeetingPayload

router = APIRouter()


@router.patch(
    "/meetings/{meeting_id}/cancel",
    status_code=status.HTTP_200_OK,
    summary="Cancel a meeting",
)
async def cancel_meeting(
        meeting_id: uuid.UUID,
        payload: CancelMeetingPayload,
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

    # ── Already cancelled ─────────────────────────────
    if meeting.status == MeetingStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Meeting is already cancelled.",
        )

    # ── Cannot cancel completed meeting ───────────────
    if meeting.status == MeetingStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a completed meeting.",
        )

    # ── Cancel meeting ────────────────────────────────
    meeting.status = MeetingStatus.cancelled

    await db.commit()

    return {
        "message": f"Meeting '{meeting.title}' has been cancelled.",
        "meeting_id": str(meeting_id),
        "status": MeetingStatus.cancelled,
        "reason": payload.reason or "No reason provided.",
    }
