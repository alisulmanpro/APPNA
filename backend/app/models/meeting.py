import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Text, Enum, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, Base


class MeetingStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


class Meeting(BaseModel):
    __tablename__ = "meetings"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)  # zoom link or address

    # ── Scheduling ────────────────────────────────────
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    status: Mapped[MeetingStatus] = mapped_column(
        Enum(MeetingStatus), default=MeetingStatus.scheduled, nullable=False, index=True
    )

    # ── AI generated fields ───────────────────────────
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    minutes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── FKs ───────────────────────────────────────────
    committee_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("committees.id", ondelete="SET NULL"),
        nullable=True,
    )
    scheduled_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ── Relationships ─────────────────────────────────
    committee: Mapped["Committee"] = relationship(back_populates="meetings")
    scheduled_by: Mapped["User"] = relationship()
    participants: Mapped[list["MeetingParticipant"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan"
    )
    documents: Mapped[list["MeetingDocument"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Meeting {self.title} | {self.scheduled_at}>"


class MeetingParticipant(Base):
    """Junction — Meeting ↔ User"""
    __tablename__ = "meeting_participants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    meeting: Mapped["Meeting"] = relationship(back_populates="participants")
    user: Mapped["User"] = relationship()


class MeetingDocument(Base):
    """Junction — Meeting ↔ Document"""
    __tablename__ = "meeting_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
    )

    meeting: Mapped["Meeting"] = relationship(back_populates="documents")
    document: Mapped["Document"] = relationship()