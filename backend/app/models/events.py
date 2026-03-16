import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Text, Enum, ForeignKey, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, Base
from decimal import Decimal


class EventStatus(str, enum.Enum):
    upcoming = "upcoming"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class Event(BaseModel):
    __tablename__ = "events"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # ── Schedule ──────────────────────────────────────
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[EventStatus] = mapped_column(
        Enum(EventStatus), default=EventStatus.upcoming, nullable=False, index=True
    )

    # ── Budget ────────────────────────────────────────
    budget: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)

    # ── FKs ───────────────────────────────────────────
    committee_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("committees.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ── Relationships ─────────────────────────────────
    committee: Mapped["Committee"] = relationship(back_populates="events")
    created_by: Mapped["User"] = relationship()
    attendees: Mapped[list["EventAttendee"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )
    vendors: Mapped[list["EventVendor"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Event {self.title} | {self.status}>"


class EventAttendee(Base):
    __tablename__ = "event_attendees"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
    )
    # nullable — allows external (non-member) attendees
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    # for external attendees
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    event: Mapped["Event"] = relationship(back_populates="attendees")
    user: Mapped["User"] = relationship()


class EventVendor(Base):
    __tablename__ = "event_vendors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    service_type: Mapped[str] = mapped_column(String(100), nullable=False)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    contract_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # S3 key
    budget_allocated: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    event: Mapped["Event"] = relationship(back_populates="vendors")
