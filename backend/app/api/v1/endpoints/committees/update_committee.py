import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.committee import Committee
from app.models.user import User
from app.schemas.committee import CommitteeResponse

router = APIRouter()


class CommitteeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    chair_id: uuid.UUID | None = None
    is_active: bool | None = None


@router.patch(
    "/committees/{committee_id}",
    response_model=CommitteeResponse,
    summary="Update committee information",
)
async def update_committee(
        committee_id: uuid.UUID,
        payload: CommitteeUpdate,
        db: AsyncSession = Depends(get_db),
):
    # ── Fetch committee ───────────────────────────────
    result = await db.execute(
        select(Committee).where(Committee.id == committee_id)
    )
    committee = result.scalar_one_or_none()

    if not committee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Committee with id '{committee_id}' not found.",
        )

    # ── Check name uniqueness if name is changing ─────
    if payload.name and payload.name != committee.name:
        existing = await db.execute(
            select(Committee).where(Committee.name == payload.name)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Committee '{payload.name}' already exists.",
            )

    # ── Validate chair exists if chair is changing ────
    if payload.chair_id:
        chair = await db.execute(
            select(User).where(
                User.id == payload.chair_id,
                User.is_active == True
            )
        )
        if not chair.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chair member with id '{payload.chair_id}' not found.",
            )

    # ── Apply only provided fields ────────────────────
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(committee, field, value)

    await db.commit()
    await db.refresh(committee)

    return committee
