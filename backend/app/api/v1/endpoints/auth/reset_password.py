import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr, field_validator
from pwdlib import PasswordHash
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.models.user import User
from app.services.email import send_password_reset_email

router = APIRouter()

password_hash = PasswordHash.recommended()


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if len(v) > 72:
            raise ValueError("Password cannot exceed 72 characters.")
        return v


# ── Step 1 — Request reset ─────────────────────────────
@router.post(
    "/auth/forgot-password",
    status_code=status.HTTP_200_OK,
    summary="Request password reset email",
)
async def forgot_password(
    payload: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    # ── Fetch user ─────────────────────────────────────
    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    user = result.scalar_one_or_none()

    # ── Always return same response ────────────────────
    # Never reveal if email exists or not — security best practice
    if not user or not user.is_active:
        return {
            "message": "If this email is registered, you will receive a reset link shortly."
        }

    # ── Generate reset token ───────────────────────────
    reset_token = secrets.token_urlsafe(32)
    user.password_reset_token = reset_token

    await db.commit()

    # ── Send email ─────────────────────────────────────
    try:
        await send_password_reset_email(
            to_email=user.email,
            first_name=user.first_name,
            reset_token=reset_token,
        )
    except Exception as e:
        # rollback token if email fails
        user.password_reset_token = None
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to send reset email. Try again later.",
        )

    return {
        "message": "If this email is registered, you will receive a reset link shortly."
    }


# ── Step 2 — Confirm reset ─────────────────────────────
@router.post(
    "/auth/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Reset password using token from email",
)
async def reset_password(
    payload: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db),
):
    # ── Passwords must match ───────────────────────────
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match.",
        )

    # ── Find user by reset token ───────────────────────
    result = await db.execute(
        select(User).where(User.password_reset_token == payload.token)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated.",
        )

    # ── Update password + clear token ─────────────────
    user.password_hash = password_hash.hash(payload.new_password)
    user.password_reset_token = None

    await db.commit()

    return {
        "message": "Password reset successfully. You can now login with your new password.",
    }