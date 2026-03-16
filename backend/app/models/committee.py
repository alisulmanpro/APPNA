import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, Base


class Committee(BaseModel):
    __tablename__ = "committees"

    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ── Chair FK ──────────────────────────────────────
    chair_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ── Relationships ─────────────────────────────────
    chair: Mapped["User"] = relationship(foreign_keys=[chair_id])
    members: Mapped[list["CommitteeMember"]] = relationship(
        back_populates="committee", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(back_populates="committee")
    documents: Mapped[list["Document"]] = relationship(back_populates="committee")
    meetings: Mapped[list["Meeting"]] = relationship(back_populates="committee")
    events: Mapped[list["Event"]] = relationship(back_populates="committee")

    def __repr__(self) -> str:
        return f"<Committee {self.name}>"


class CommitteeMember(Base):
    """Junction table — User ↔ Committee"""
    __tablename__ = "committee_members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    committee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("committees.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────
    committee: Mapped["Committee"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="committee_memberships")

    def __repr__(self) -> str:
        return f"<CommitteeMember committee={self.committee_id} user={self.user_id}>"
