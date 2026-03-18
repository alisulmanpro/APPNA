import uuid
from pydantic import BaseModel
from datetime import datetime
from app.models.meeting import MeetingStatus


class MeetingCreate(BaseModel):
    title: str
    description: str | None = None
    location: str | None = None
    scheduled_at: datetime
    duration_minutes: int = 60
    committee_id: uuid.UUID | None = None
    scheduled_by_id: uuid.UUID | None = None


class MeetingResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    location: str | None
    scheduled_at: datetime
    duration_minutes: int
    status: MeetingStatus
    committee_id: uuid.UUID | None
    scheduled_by_id: uuid.UUID | None
    ai_summary: str | None
    minutes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MeetingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    scheduled_at: datetime | None = None
    duration_minutes: int | None = None
    committee_id: uuid.UUID | None = None
    transcript: str | None = None   # ← add
    minutes: str | None = None      # ← add


class CancelMeetingPayload(BaseModel):
    reason: str | None = None