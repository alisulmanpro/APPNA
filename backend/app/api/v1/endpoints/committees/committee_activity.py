import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.committee import Committee, CommitteeMember
from app.models.tasks import Task, TaskStatus
from app.models.meeting import Meeting
from app.models.documents import Document

router = APIRouter()


@router.get(
    "/committees/{committee_id}/activity",
    summary="Committee activity history",
)
async def committee_activity(
        committee_id: uuid.UUID,
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, ge=1, le=100),
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

    # ── Members ───────────────────────────────────────
    members_result = await db.execute(
        select(CommitteeMember).where(
            CommitteeMember.committee_id == committee_id
        )
    )
    members = members_result.scalars().all()

    # ── Tasks ─────────────────────────────────────────
    tasks_result = await db.execute(
        select(Task).where(Task.committee_id == committee_id)
        .order_by(Task.created_at.desc())
        .limit(limit)
    )
    tasks = tasks_result.scalars().all()

    # ── Meetings ──────────────────────────────────────
    meetings_result = await db.execute(
        select(Meeting).where(Meeting.committee_id == committee_id)
        .order_by(Meeting.scheduled_at.desc())
        .limit(limit)
    )
    meetings = meetings_result.scalars().all()

    # ── Documents ─────────────────────────────────────
    documents_result = await db.execute(
        select(Document).where(Document.committee_id == committee_id)
        .order_by(Document.created_at.desc())
        .limit(limit)
    )
    documents = documents_result.scalars().all()

    # ── Task stats ────────────────────────────────────
    task_stats = {
        "total": len(tasks),
        "pending": sum(1 for t in tasks if t.status == TaskStatus.pending),
        "in_progress": sum(1 for t in tasks if t.status == TaskStatus.in_progress),
        "completed": sum(1 for t in tasks if t.status == TaskStatus.completed),
        "cancelled": sum(1 for t in tasks if t.status == TaskStatus.cancelled),
    }

    return {
        "committee": {
            "id": str(committee.id),
            "name": committee.name,
            "is_active": committee.is_active,
            "chair_id": str(committee.chair_id) if committee.chair_id else None,
        },
        "stats": {
            "total_members": len(members),
            "total_tasks": task_stats["total"],
            "total_meetings": len(meetings),
            "total_documents": len(documents),
            "task_breakdown": task_stats,
        },
        "recent_tasks": [
            {
                "id": str(t.id),
                "title": t.title,
                "status": t.status,
                "priority": t.priority,
                "due_date": t.due_date,
                "created_at": t.created_at,
            }
            for t in tasks
        ],
        "recent_meetings": [
            {
                "id": str(m.id),
                "title": m.title,
                "status": m.status,
                "scheduled_at": m.scheduled_at,
            }
            for m in meetings
        ],
        "recent_documents": [
            {
                "id": str(d.id),
                "title": d.title,
                "status": d.status,
                "created_at": d.created_at,
            }
            for d in documents
        ],
    }
