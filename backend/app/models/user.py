import uuid
import enum
from sqlalchemy import String, Boolean, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    president = "president"
    admin = "admin"
    committee_chair = "committee_chair"
    member = "member"


class User(BaseModel):
    __tablename__ = "users"

    # ── Identity ──────────────────────────────────────
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # ── Profile ───────────────────────────────────────
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile_picture_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # ── Role & Status ─────────────────────────────────
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), nullable=False, default=UserRole.member
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── Auth helpers ──────────────────────────────────
    password_reset_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email_verify_token: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # New field for refresh token (e.g., for JWT refresh token rotation)
    # You can store the raw token here (or hash it in your auth service for extra security).
    refresh_token: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ── Relationships ─────────────────────────────────
    committee_memberships: Mapped[list["CommitteeMember"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    assigned_tasks: Mapped[list["Task"]] = relationship(
        back_populates="assigned_to", foreign_keys="Task.assigned_to_id"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User {self.email} | {self.role}>"