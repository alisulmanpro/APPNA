import csv
import io
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pwdlib import PasswordHash

from app.core.database import get_db
from app.models.user import User, UserRole

router = APIRouter()

REQUIRED_COLUMNS = {"first_name", "last_name", "email", "password"}
ALLOWED_ROLES = {role.value for role in UserRole}


@router.post(
    "/members/import",
    status_code=status.HTTP_200_OK,
    summary="Import members via CSV",
)
async def import_members(
        file: UploadFile = File(...),
        db: AsyncSession = Depends(get_db),
):
    # ── Validate file type ────────────────────────────
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .csv files are accepted.",
        )

    # ── Read file ─────────────────────────────────────
    content = await file.read()
    try:
        decoded = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File encoding must be UTF-8.",
        )

    reader = csv.DictReader(io.StringIO(decoded))

    # ── Validate columns ──────────────────────────────
    if not reader.fieldnames:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty.",
        )

    missing_columns = REQUIRED_COLUMNS - set(reader.fieldnames)
    if missing_columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required columns: {', '.join(missing_columns)}",
        )

    # ── Process rows ──────────────────────────────────
    created = []
    skipped = []
    errors = []

    for i, row in enumerate(reader, start=2):  # start=2 because row 1 is header
        email = row.get("email", "").strip().lower()
        first_name = row.get("first_name", "").strip()
        last_name = row.get("last_name", "").strip()
        password = row.get("password", "").strip()
        phone = row.get("phone", "").strip() or None
        location = row.get("location", "").strip() or None
        role_value = row.get("role", "member").strip().lower()

        # ── Row level validation ───────────────────────
        if not email or not first_name or not last_name or not password:
            errors.append({"row": i, "reason": "Missing required fields."})
            continue

        if len(password) < 8 or len(password) > 72:
            errors.append({"row": i, "email": email, "reason": "Password must be 8–72 characters."})
            continue

        if role_value not in ALLOWED_ROLES:
            errors.append({"row": i, "email": email, "reason": f"Invalid role '{role_value}'."})
            continue

        # ── Check duplicate email ──────────────────────
        existing = await db.execute(select(User).where(User.email == email))
        if existing.scalar_one_or_none():
            skipped.append({"row": i, "email": email, "reason": "Email already exists."})
            continue

        password_hash = PasswordHash.recommended()
        # ── Create member ──────────────────────────────
        member = User(
            email=email,
            password_hash=password_hash.hash(password),
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            location=location,
            role=UserRole(role_value),
        )
        db.add(member)
        created.append(email)

    await db.commit()

    return {
        "summary": {
            "total_rows": len(created) + len(skipped) + len(errors),
            "created": len(created),
            "skipped": len(skipped),
            "errors": len(errors),
        },
        "created": created,
        "skipped": skipped,
        "errors": errors,
    }
