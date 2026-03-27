from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pwdlib import PasswordHash

from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, RegisterResponse

router = APIRouter()


@router.post(
    "/auth/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    # ── Check duplicate email ──────────────────────────
    existing = await db.execute(
        select(User).where(User.email == payload.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{payload.email}' is already registered.",
        )

    # ── Hash password ──────────────────────────────────
    password_hash= PasswordHash.recommended()
    pwd_hash = password_hash.hash(payload.password)

    # ── Create user ────────────────────────────────────
    user = User(
        email=payload.email,
        password_hash=pwd_hash,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        location=payload.location,
        role=payload.role,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user