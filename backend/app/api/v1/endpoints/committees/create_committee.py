from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.committee import Committee
from app.models.user import User
from app.schemas.committee import CommitteeCreate, CommitteeResponse

router = APIRouter()


@router.post(
    "/committees",
    response_model=CommitteeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new committee",
)
async def create_committee(
    payload: CommitteeCreate,
    db: AsyncSession = Depends(get_db),
):
    # ── Check duplicate name ───────────────────────────
    existing = await db.execute(
        select(Committee).where(Committee.name == payload.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Committee '{payload.name}' already exists.",
        )

    # ── Validate chair exists if provided ─────────────
    if payload.chair_id:
        chair = await db.execute(
            select(User).where(User.id == payload.chair_id, User.is_active == True)
        )
        if not chair.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chair member with id '{payload.chair_id}' not found.",
            )

    # ── Create committee ──────────────────────────────
    committee = Committee(
        name=payload.name,
        description=payload.description,
        chair_id=payload.chair_id,
    )

    db.add(committee)
    await db.commit()
    await db.refresh(committee)

    return committee