import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.meeting import Meeting, MeetingDocument, MeetingStatus
from app.models.documents import Document

router = APIRouter()


class AttachDocumentsPayload(BaseModel):
    document_ids: list[uuid.UUID]


@router.post(
    "/meetings/{meeting_id}/documents",
    status_code=status.HTTP_201_CREATED,
    summary="Attach documents to a meeting",
)
async def attach_documents(
        meeting_id: uuid.UUID,
        payload: AttachDocumentsPayload,
        db: AsyncSession = Depends(get_db),
):
    # ── Fetch meeting ─────────────────────────────────
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id)
    )
    meeting = meeting_result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with id '{meeting_id}' not found.",
        )

    # ── Cannot attach to cancelled meeting ────────────
    if meeting.status == MeetingStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot attach documents to a cancelled meeting.",
        )

    # ── Process each document ─────────────────────────
    attached = []
    skipped = []

    for document_id in payload.document_ids:

        # check document exists
        doc_result = await db.execute(
            select(Document).where(Document.id == document_id)
        )
        document = doc_result.scalar_one_or_none()

        if not document:
            skipped.append({
                "document_id": str(document_id),
                "reason": "Document not found.",
            })
            continue

        # check already attached
        existing = await db.execute(
            select(MeetingDocument).where(
                MeetingDocument.meeting_id == meeting_id,
                MeetingDocument.document_id == document_id,
            )
        )
        if existing.scalar_one_or_none():
            skipped.append({
                "document_id": str(document_id),
                "reason": f"'{document.title}' is already attached to this meeting.",
            })
            continue

        # attach document
        meeting_document = MeetingDocument(
            meeting_id=meeting_id,
            document_id=document_id,
        )
        db.add(meeting_document)
        attached.append({
            "document_id": str(document_id),
            "title": document.title,
            "status": document.status,
        })

    await db.commit()

    return {
        "meeting_id": str(meeting_id),
        "meeting_title": meeting.title,
        "summary": {
            "attached": len(attached),
            "skipped": len(skipped),
        },
        "attached": attached,
        "skipped": skipped,
    }
