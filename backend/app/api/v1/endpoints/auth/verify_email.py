import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.email import send_verification_email

router = APIRouter()


class VerifyEmailRequest(BaseModel):
    token: str


# ── Step 1 — Send verification email ──────────────────
@router.post(
    "/auth/send-verification",
    status_code=status.HTTP_200_OK,
    summary="Send email verification link",
)
async def send_verification(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ── Already verified ───────────────────────────────
    if current_user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already verified.",
        )

    # ── Generate token ─────────────────────────────────
    verify_token = secrets.token_urlsafe(32)
    current_user.email_verify_token = verify_token

    await db.commit()

    # ── Send email ─────────────────────────────────────
    try:
        await send_verification_email(
            to_email=current_user.email,
            first_name=current_user.first_name,
            verify_token=verify_token,
        )
    except Exception:
        current_user.email_verify_token = None
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to send verification email. Try again later.",
        )

    return {
        "message": "Verification email sent. Please check your inbox.",
    }


# ── Step 2 — Confirm verification ─────────────────────
@router.post(
    "/auth/verify-email",
    status_code=status.HTTP_200_OK,
    summary="Verify email using token from email",
)
async def verify_email(
    payload: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    # ── Find user by token ─────────────────────────────
    result = await db.execute(
        select(User).where(User.email_verify_token == payload.token)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token.",
        )

    # ── Already verified ───────────────────────────────
    if user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already verified.",
        )

    # ── Mark as verified + clear token ────────────────
    user.is_email_verified = True
    user.email_verify_token = None

    await db.commit()

    return {
        "message": "Email verified successfully. Your account is now fully active.",
    }