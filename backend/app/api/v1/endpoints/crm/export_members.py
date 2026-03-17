import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.user import User, UserRole

router = APIRouter()


@router.get(
    "/members/export",
    summary="Export member data as CSV",
)
async def export_members(
        include_inactive: bool = Query(default=False, description="Include deactivated members"),
        role: UserRole | None = Query(default=None, description="Filter by role before export"),
        db: AsyncSession = Depends(get_db),
):
    # ── Base query ────────────────────────────────────
    query = select(User)

    if not include_inactive:
        query = query.where(User.is_active == True)

    if role:
        query = query.where(User.role == role)

    result = await db.execute(query.order_by(User.created_at.desc()))
    members = result.scalars().all()

    # ── Build CSV in memory ───────────────────────────
    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Role",
        "Location",
        "Is Active",
        "Email Verified",
        "Created At",
    ])

    # Data rows
    for m in members:
        writer.writerow([
            str(m.id),
            m.first_name,
            m.last_name,
            m.email,
            m.phone or "",
            m.role.value,
            m.location or "",
            m.is_active,
            m.is_email_verified,
            m.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        ])

    output.seek(0)

    # ── Stream response ───────────────────────────────
    return StreamingResponse(
        content=iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=appna_members.csv"
        }
    )
