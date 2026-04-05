import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.meeting import Meeting, MeetingParticipant, MeetingStatus
from app.models.user import User
from app.services.email_service import APPNAEmail, EmailType, MeetingPayload

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
            "email": user.email,  # Store email for later use
        })

    await db.commit()

    # ── Send emails to all added participants ─────────
    email_service = APPNAEmail()
    email_results = []

    for participant_info in added:
        try:
            # Format meeting date and time for email
            meeting_date = meeting.scheduled_at.strftime("%B %d, %Y") if meeting.scheduled_at else "TBD"
            meeting_time = meeting.scheduled_at.strftime("%I:%M %p") if meeting.scheduled_at else "TBD"

            # Create email payload with meeting details
            email_payload = MeetingPayload(
                to=participant_info["email"],
                name=participant_info["name"],
                meeting_title=meeting.title,
                meeting_date=meeting_date,
                meeting_time=meeting_time,
                location=meeting.location or "To be confirmed",  # Uses location field (zoom link or address)
                committee_name=meeting.committee.name if meeting.committee else "Unknown",
                duration_minutes=meeting.duration_minutes or 60,
                meeting_link=meeting.location if meeting.location and (
                        meeting.location.startswith("http") or meeting.location.startswith("zoom")) else None,
            )

            # Send email
            result = await email_service.send(
                EmailType.MEETING_SCHEDULED,
                email_payload
            )
            email_results.append({
                "user_id": str(participant_info["user_id"]),
                "email": participant_info["email"],
                "email_sent": result["success"],
                "email_id": result.get("id"),
            })
        except Exception as e:
            email_results.append({
                "user_id": str(participant_info["user_id"]),
                "email": participant_info["email"],
                "email_sent": False,
                "error": str(e),
            })

    return {
        "meeting_id": str(meeting_id),
        "meeting_title": meeting.title,
        "summary": {
            "added": len(added),
            "skipped": len(skipped),
            "emails_sent": sum(1 for r in email_results if r["email_sent"]),
        },
        "added": added,
        "skipped": skipped,
        "email_results": email_results,
    }
