import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.committee import Committee
from app.schemas.committee import CommitteeResponse

router = APIRouter()


@router.get(
    "/committees/{committee_id}",
    summary="View committee details",
)
async def view_committee(
        committee_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
):
    # ── Fetch committee with members ──────────────────
    result = await db.execute(
        select(Committee)
        .options(selectinload(Committee.members))
        .where(Committee.id == committee_id)
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
            detail=f"Committee '{committee.name}' has been deactivated.",
        )

    return {
        "id": str(committee.id),
        "name": committee.name,
        "description": committee.description,
        "is_active": committee.is_active,
        "chair_id": str(committee.chair_id) if committee.chair_id else None,
        "total_members": len(committee.members),
        "created_at": committee.created_at,
        "updated_at": committee.updated_at,
    }
