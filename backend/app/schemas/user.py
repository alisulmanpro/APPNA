import uuid
from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import UserRole


class MemberCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str | None = None
    location: str | None = None
    bio: str | None = None
    role: UserRole = UserRole.member

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if len(v) > 72:
            raise ValueError("Password cannot exceed 72 characters.")
        return v


class MemberResponse(BaseModel):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    phone: str | None
    location: str | None
    role: UserRole
    is_active: bool
    is_email_verified: bool

    model_config = {"from_attributes": True}


class MemberUpdate(BaseModel):
    email: EmailStr | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    location: str | None = None
    bio: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None
