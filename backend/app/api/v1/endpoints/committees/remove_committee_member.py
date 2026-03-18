import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import get_db
from app.models.committee import Committee, CommitteeMember
from app.models.user import User

router = APIRouter()


@router.delete(
    "/committees/{committee_id}/members/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Remove a member from a committee",
)
async def remove_committee_member(
        committee_id: uuid.UUID,
        user_id: uuid.UUID,
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

    # ── Fetch user ────────────────────────────────────
    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with id '{user_id}' not found.",
        )

    # ── Check membership exists ───────────────────────
    membership_result = await db.execute(
        select(CommitteeMember).where(
            CommitteeMember.committee_id == committee_id,
            CommitteeMember.user_id == user_id,
        )
    )
    membership = membership_result.scalar_one_or_none()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"'{user.first_name} {user.last_name}' is not a member of '{committee.name}'.",
        )

    # ── Prevent removing the chair ────────────────────
    if committee.chair_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot remove '{user.first_name} {user.last_name}' — they are the committee chair. Assign a new chair first.",
        )

    # ── Remove member ─────────────────────────────────
    await db.execute(
        delete(CommitteeMember).where(
            CommitteeMember.committee_id == committee_id,
            CommitteeMember.user_id == user_id,
        )
    )
    await db.commit()

    return {
        "message": f"'{user.first_name} {user.last_name}' removed from '{committee.name}'.",
        "committee_id": str(committee_id),
        "user_id": str(user_id),
    }
