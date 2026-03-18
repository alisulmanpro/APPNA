import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.meeting import Meeting, MeetingParticipant, MeetingStatus
from app.models.user import User

router = APIRouter()


class AddParticipantsPayload(BaseModel):
    user_ids: list[uuid.UUID]


@router.post(
    "/meetings/{meeting_id}/participants",
    status_code=status.HTTP_201_CREATED,
    summary="Add participants to a meeting",
)
async def add_participants(
        meeting_id: uuid.UUID,
        payload: AddParticipantsPayload,
        db: AsyncSession = Depends(get_db),
):
    # ── Fetch meeting ─────────────────────────────────
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id)
    )
    meeting = meeting_result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with id '{meeting_id}' not found.",
        )

    # ── Cannot add to cancelled/completed ─────────────
    if meeting.status == MeetingStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add participants to a cancelled meeting.",
        )

    if meeting.status == MeetingStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add participants to a completed meeting.",
        )

    # ── Process each user ─────────────────────────────
    added = []
    skipped = []

    for user_id in payload.user_ids:

        # check user exists
        user_result = await db.execute(
            select(User).where(
                User.id == user_id,
                User.is_active == True,
            )
        )
        user = user_result.scalar_one_or_none()

        if not user:
            skipped.append({
                "user_id": str(user_id),
                "reason": "User not found or inactive.",
            })
            continue

        # check already a participant
        existing = await db.execute(
            select(MeetingParticipant).where(
                MeetingParticipant.meeting_id == meeting_id,
                MeetingParticipant.user_id == user_id,
            )
        )
        if existing.scalar_one_or_none():
            skipped.append({
                "user_id": str(user_id),
                "reason": f"'{user.first_name} {user.last_name}' is already a participant.",
            })
            continue

        # add participant
        participant = MeetingParticipant(
            meeting_id=meeting_id,
            user_id=user_id,
            joined_at=datetime.now(timezone.utc),
        )
        db.add(participant)
        added.append({
            "user_id": str(user_id),
            "name": f"{user.first_name} {user.last_name}",
        })

    await db.commit()

    return {
        "meeting_id": str(meeting_id),
        "meeting_title": meeting.title,
        "summary": {
            "added": len(added),
            "skipped": len(skipped),
        },
        "added": added,
        "skipped": skipped,
    }
