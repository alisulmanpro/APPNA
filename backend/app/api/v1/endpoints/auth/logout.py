from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import decode_token
from app.models.token_blacklist import TokenBlacklist

router = APIRouter()


class LogoutRequest(BaseModel):
    access_token: str
    refresh_token: str | None = None


@router.post(
    "/auth/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout — invalidate access and refresh tokens",
)
async def logout(
    payload: LogoutRequest,
    db: AsyncSession = Depends(get_db),
):
    tokens_to_blacklist = []

    # ── Validate and blacklist access token ────────────
    try:
        access_data = decode_token(payload.access_token)
        tokens_to_blacklist.append({
            "token": payload.access_token,
            "expires_at": datetime.fromtimestamp(
                access_data["exp"], tz=timezone.utc
            )
        })
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid access token: {str(e)}",
        )

    # ── Blacklist refresh token if provided ────────────
    if payload.refresh_token:
        try:
            refresh_data = decode_token(payload.refresh_token)
            tokens_to_blacklist.append({
                "token": payload.refresh_token,
                "expires_at": datetime.fromtimestamp(
                    refresh_data["exp"], tz=timezone.utc
                )
            })
        except ValueError:
            pass  # refresh token invalid — ignore, still logout

    # ── Check if already blacklisted ───────────────────
    existing = await db.execute(
        select(TokenBlacklist).where(
            TokenBlacklist.token == payload.access_token
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Token already invalidated.",
        )

    # ── Save to blacklist ──────────────────────────────
    for t in tokens_to_blacklist:
        db.add(TokenBlacklist(
            token=t["token"],
            expires_at=t["expires_at"],
        ))

    await db.commit()

    return {
        "message": "Logged out successfully.",
        "tokens_invalidated": len(tokens_to_blacklist),
    }