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


class AssignChairPayload(BaseModel):
    chair_id: uuid.UUID


@router.patch(
    "/committees/{committee_id}/assign-chair",
    response_model=CommitteeResponse,
    summary="Assign a chair to a committee",
)
async def assign_chair(
        committee_id: uuid.UUID,
        payload: AssignChairPayload,
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

    if not committee.is_active:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail=f"Committee '{committee.name}' is deactivated.",
        )

    # ── Validate chair member ─────────────────────────
    chair_result = await db.execute(
        select(User).where(
            User.id == payload.chair_id,
            User.is_active == True
        )
    )
    chair = chair_result.scalar_one_or_none()

    if not chair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with id '{payload.chair_id}' not found or inactive.",
        )

    # ── Already the chair ─────────────────────────────
    if committee.chair_id == payload.chair_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"'{chair.first_name} {chair.last_name}' is already the chair.",
        )

    # ── Assign chair ──────────────────────────────────
    committee.chair_id = payload.chair_id

    await db.commit()
    await db.refresh(committee)

    return committee
