from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import decode_token, is_token_blacklisted
from app.core.database import get_db
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer()


# ── Get current user from token ────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials

    # ── Decode token ───────────────────────────────────
    try:
        payload = decode_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Must be access token ───────────────────────────
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Check blacklist ────────────────────────────────
    if await is_token_blacklisted(token, db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been invalidated. Please login again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Fetch user from DB ─────────────────────────────
    result = await db.execute(
        select(User).where(User.id == payload["sub"])
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )

    return user


# ── Role checker factory ───────────────────────────────
def require_roles(*roles: UserRole):
    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in roles]}",
            )
        return current_user
    return role_checker


# ── Shortcut dependencies ──────────────────────────────
require_president = require_roles(UserRole.president)

require_admin = require_roles(
    UserRole.president,
    UserRole.admin,
)

require_chair = require_roles(
    UserRole.president,
    UserRole.admin,
    UserRole.committee_chair,
)

require_member = require_roles(
    UserRole.president,
    UserRole.admin,
    UserRole.committee_chair,
    UserRole.member,
)

# ── Any authenticated user ─────────────────────────────
get_authenticated_user = get_current_user