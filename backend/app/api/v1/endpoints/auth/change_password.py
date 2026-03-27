from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, field_validator
from pwdlib import PasswordHash

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

password_hash = PasswordHash.recommended()


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if len(v) > 72:
            raise ValueError("Password cannot exceed 72 characters.")
        return v


@router.patch(
    "/auth/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change current user password",
)
async def change_password(
    payload: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ── Confirm passwords match ────────────────────────
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirm password do not match.",
        )

    # ── Verify current password ────────────────────────
    if not password_hash.verify(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect.",
        )

    # ── Cannot reuse same password ─────────────────────
    if password_hash.verify(payload.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as current password.",
        )

    # ── Update password ────────────────────────────────
    current_user.password_hash = password_hash.hash(payload.new_password)

    await db.commit()

    return {
        "message": "Password changed successfully. Please login again with your new password.",
    }