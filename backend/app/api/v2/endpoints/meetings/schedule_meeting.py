from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.meeting import Meeting
from app.models.committee import Committee
from app.models.user import User
from app.schemas.meeting import MeetingCreate, MeetingResponse
from app.services.email_service import (
    APPNAEmail,
    EmailType,
    MeetingPayload,
    BroadcastPayload,
)

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
    committee = None
    if payload.committee_id:
        committee_result = await db.execute(
            select(Committee).where(
                Committee.id == payload.committee_id,
                Committee.is_active == True,
            )
        )
        committee = committee_result.scalar_one_or_none()
        if not committee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Committee with id '{payload.committee_id}' not found.",
            )

    # ── Fetch scheduler user details ──────────────────
    scheduler_result = await db.execute(
        select(User).where(User.id == payload.scheduled_by_id)
    )
    scheduler = scheduler_result.scalar_one_or_none()

    if not scheduler:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{payload.scheduled_by_id}' not found.",
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

    # ── Send confirmation email to scheduler ─────────
    email_service = APPNAEmail()

    try:
        # Format meeting date and time
        meeting_date = meeting.scheduled_at.strftime("%B %d, %Y")
        meeting_time = meeting.scheduled_at.strftime("%I:%M %p")

        # Determine if location is a meeting link
        is_meeting_link = (
                meeting.location
                and (
                        meeting.location.startswith("http")
                        or meeting.location.startswith("zoom")
                )
        )

        # Create payload for scheduler confirmation
        confirmation_payload = MeetingPayload(
            to=scheduler.email,
            name=scheduler.first_name,
            meeting_title=meeting.title,
            meeting_date=meeting_date,
            meeting_time=meeting_time,
            location=meeting.location or "To be confirmed",
            committee_name=committee.name if committee else "N/A",
            duration_minutes=meeting.duration_minutes or 60,
            meeting_link=meeting.location if is_meeting_link else None,
        )

        # Send confirmation email
        result = await email_service.send(
            EmailType.MEETING_SCHEDULED, confirmation_payload
        )

        if not result["success"]:
            # Log error but don't fail the request
            print(f"Warning: Failed to send confirmation email: {result.get('error')}")

    except Exception as e:
        # Log error but don't fail the request
        print(f"Warning: Error sending confirmation email: {str(e)}")

    return meeting
