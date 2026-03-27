from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.security import create_access_token, decode_token

router = APIRouter()


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post(
    "/auth/refresh",
    response_model=RefreshResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token using refresh token",
)
async def refresh_token(payload: RefreshRequest):
    # ── Decode refresh token ───────────────────────────
    try:
        data = decode_token(payload.refresh_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    # ── Must be a refresh token, not access token ──────
    if data.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type. Provide a refresh token.",
        )

    # ── Issue new access token ─────────────────────────
    new_access_token = create_access_token(data={
        "sub": data["sub"],
        "email": data["email"],
        "role": data["role"],
    })

    return RefreshResponse(access_token=new_access_token)
