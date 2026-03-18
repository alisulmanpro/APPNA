import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.committee import Committee, CommitteeMember
from app.models.user import User

router = APIRouter()


class AddMemberPayload(BaseModel):
    user_id: uuid.UUID


@router.post(
    "/committees/{committee_id}/members",
    status_code=status.HTTP_201_CREATED,
    summary="Add a member to a committee",
)
async def add_committee_member(
        committee_id: uuid.UUID,
        payload: AddMemberPayload,
        db: AsyncSession = Depends(get_db),
):
    # ── Fetch committee ───────────────────────────────
    committee_result = await db.execute(
        select(Committee).where(Committee.id == committee_id)
    )
    committee = committee_result.scalar_one_or_none()

    if not committee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Committee with id '{committee_id}' not found.",
        )

    if not committee.is_active:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail=f"Committee '{committee.name}' is deactivated.",
        )

    # ── Fetch user ────────────────────────────────────
    user_result = await db.execute(
        select(User).where(
            User.id == payload.user_id,
            User.is_active == True
        )
    )
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with id '{payload.user_id}' not found or inactive.",
        )

    # ── Check already a member ────────────────────────
    existing = await db.execute(
        select(CommitteeMember).where(
            CommitteeMember.committee_id == committee_id,
            CommitteeMember.user_id == payload.user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"'{user.first_name} {user.last_name}' is already a member of '{committee.name}'.",
        )

    # ── Add member ────────────────────────────────────
    committee_member = CommitteeMember(
        committee_id=committee_id,
        user_id=payload.user_id,
        joined_at=datetime.now(timezone.utc),
    )

    db.add(committee_member)
    await db.commit()

    return {
        "message": f"'{user.first_name} {user.last_name}' added to '{committee.name}'.",
        "committee_id": str(committee_id),
        "user_id": str(payload.user_id),
        "joined_at": committee_member.joined_at,
    }
