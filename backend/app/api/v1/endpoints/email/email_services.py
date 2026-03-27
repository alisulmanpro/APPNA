from fastapi import APIRouter, HTTPException
from app.services.email_service import (
    APPNAEmail,
    EmailType,
    WelcomePayload,
    ActivationPayload,
    PasswordResetPayload,
)

router = APIRouter(prefix="/email", tags=["Email"])

email_service = APPNAEmail()


@router.post("/welcome")
async def send_welcome_email(payload: WelcomePayload):
    result = await email_service.send(EmailType.WELCOME, payload)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return {"message": "Welcome email sent", "id": result["id"]}


@router.post("/activation")
async def send_activation_email(payload: ActivationPayload):
    result = await email_service.send(EmailType.ACCOUNT_ACTIVATION, payload)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return {"message": "Activation email sent", "id": result["id"]}


@router.post("/password-reset")
async def send_password_reset_email(payload: PasswordResetPayload):
    result = await email_service.send(EmailType.PASSWORD_RESET, payload)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return {"message": "Password reset email sent", "id": result["id"]}