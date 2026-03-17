from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pwdlib import PasswordHash
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import MemberCreate, MemberResponse

router = APIRouter()


def hash_password(password: str) -> str:
    password_hash = PasswordHash.recommended()
    hashed = password_hash.hash(password)
    return hashed


@router.post(
    "/add-members",
    response_model=MemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new member",
)
async def add_member(
        payload: MemberCreate,
        db: AsyncSession = Depends(get_db),
):
    # ── Check duplicate email ──────────────────────────
    existing = await db.execute(
        select(User).where(User.email == payload.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Member with email '{payload.email}' already exists.",
        )

    # ── Create member ─────────────────────────────────
    member = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        location=payload.location,
        bio=payload.bio,
        role=payload.role,
    )

    db.add(member)
    await db.commit()
    await db.refresh(member)

    return member
