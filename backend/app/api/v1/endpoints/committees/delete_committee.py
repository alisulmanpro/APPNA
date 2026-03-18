import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.committee import Committee

router = APIRouter()


@router.delete(
    "/committees/{committee_id}",
    status_code=status.HTTP_200_OK,
    summary="Soft delete a committee",
)
async def delete_committee(
        committee_id: uuid.UUID,
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

    # ── Already deactivated ───────────────────────────
    if not committee.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Committee '{committee.name}' is already deactivated.",
        )

    # ── Soft delete ───────────────────────────────────
    committee.is_active = False

    await db.commit()

    return {
        "message": f"Committee '{committee.name}' has been deactivated.",
        "committee_id": str(committee_id),
        "is_active": False,
    }
