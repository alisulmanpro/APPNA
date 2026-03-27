from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import RegisterResponse

router = APIRouter()


@router.get(
    "/auth/me",
    response_model=RegisterResponse,
    summary="Get current logged in user",
)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user