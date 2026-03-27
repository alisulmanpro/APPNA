import resend
from app.core.config import settings

resend.api_key = settings.resend_api_key


async def send_password_reset_email(
    to_email: str,
    first_name: str,
    reset_token: str,
) -> None:
    reset_link = f"{settings.accept_url}/reset-password?token={reset_token}"

    resend.Emails.send({
        "from": settings.from_email,
        "to": to_email,
        "subject": "APPNA — Password Reset Request",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Dear {first_name},</p>
            <p>We received a request to reset your APPNA account password.</p>
            <p>Click the button below to reset your password. This link expires in <strong>30 minutes</strong>.</p>
            <a href="{reset_link}"
               style="
                background-color: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
                margin: 16px 0;
               ">
               Reset Password
            </a>
            <p>If you did not request this, ignore this email. Your password will not change.</p>
            <p>— APPNA Tech Team</p>
        </div>
        """,
    })


async def send_verification_email(
    to_email: str,
    first_name: str,
    verify_token: str,
) -> None:
    verify_link = f"{settings.accept_url}/verify-email?token={verify_token}"

    resend.Emails.send({
        "from": settings.from_email,
        "to": to_email,
        "subject": "APPNA — Verify Your Email Address",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email Address</h2>
            <p>Dear {first_name},</p>
            <p>Welcome to APPNA! Please verify your email address to activate your account.</p>
            <a href="{verify_link}"
               style="
                background-color: #16a34a;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
                margin: 16px 0;
               ">
               Verify Email
            </a>
            <p>If you did not create an APPNA account, ignore this email.</p>
            <p>— APPNA Tech Team</p>
        </div>
        """,
    })