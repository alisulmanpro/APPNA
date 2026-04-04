from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pwdlib import PasswordHash
from secrets import token_urlsafe

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import RegisterRequest, RegisterResponse
from app.services.email_service import APPNAEmail, EmailType, ActivationPayload

router = APIRouter()

email_service = APPNAEmail()


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
    ph = PasswordHash.recommended()  # Fixed variable name
    pwd_hash = ph.hash(payload.password)

    # ── Generate verification token ────────────────────
    verify_token = token_urlsafe(32)  # Secure random token

    # ── Create user ────────────────────────────────────
    user = User(
        email=payload.email,
        password_hash=pwd_hash,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        location=payload.location,
        role=payload.role,
        email_verify_token=verify_token,  # Important for activation
        # refresh_token remains None (will be set during login)
        is_email_verified=False,  # Explicit for clarity
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # ── Send activation email automatically ────────────
    activation_link = f"{settings.accept_url}/verify-email?token={verify_token}"

    email_result = await email_service.send(
        EmailType.ACCOUNT_ACTIVATION,
        ActivationPayload(
            to=user.email,
            name=f"{user.first_name} {user.last_name}",
            activation_link=activation_link,
        ),
    )

    if not email_result["success"]:
        # Don't block registration if email fails (you can log it later)
        print(f"⚠️ Activation email failed for {user.email}: {email_result['error']}")

    return user
