import uuid
from pydantic import BaseModel
from datetime import datetime


class CommitteeCreate(BaseModel):
    name: str
    description: str | None = None
    chair_id: uuid.UUID | None = None


class CommitteeResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    is_active: bool
    chair_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}