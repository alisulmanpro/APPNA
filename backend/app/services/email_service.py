# app/services/email_service.py
import resend
import asyncio
from enum import Enum
from dataclasses import dataclass
from datetime import datetime
from app.core.config import settings


# ── Email Types ────────────────────────────────────────────────
class EmailType(str, Enum):
    # Auth
    ACCOUNT_ACTIVATION = "account_activation"
    PASSWORD_RESET = "password_reset"
    EMAIL_VERIFICATION = "email_verification"
    WELCOME = "welcome"
    ACCOUNT_DEACTIVATED = "account_deactivated"

    # Meetings
    MEETING_SCHEDULED = "meeting_scheduled"
    MEETING_UPDATED = "meeting_updated"
    MEETING_CANCELLED = "meeting_cancelled"
    MEETING_REMINDER = "meeting_reminder"
    MEETING_SUMMARY = "meeting_summary"

    # Tasks
    TASK_ASSIGNED = "task_assigned"
    TASK_DUE_SOON = "task_due_soon"
    TASK_OVERDUE = "task_overdue"
    TASK_COMPLETED = "task_completed"

    # Documents & Approvals
    DOCUMENT_SUBMITTED = "document_submitted"
    DOCUMENT_APPROVED = "document_approved"
    DOCUMENT_REJECTED = "document_rejected"

    # Committee
    COMMITTEE_ADDED = "committee_added"
    COMMITTEE_REMOVED = "committee_removed"
    CHAIR_ASSIGNED = "chair_assigned"

    # Announcements
    BROADCAST = "broadcast"
    EVENT_ANNOUNCEMENT = "event_announcement"


# ── Email Data Contracts ───────────────────────────────────────
@dataclass
class EmailPayload:
    to: str
    name: str


@dataclass
class ActivationPayload(EmailPayload):
    activation_link: str


@dataclass
class PasswordResetPayload(EmailPayload):
    reset_link: str
    expires_in: str = "1 hour"


@dataclass
class WelcomePayload(EmailPayload):
    role: str
    login_link: str


@dataclass
class MeetingPayload(EmailPayload):
    meeting_title: str
    meeting_date: str
    meeting_time: str
    location: str
    committee_name: str
    duration_minutes: int
    meeting_link: str | None = None
    cancellation_reason: str | None = None
    ai_summary: str | None = None


@dataclass
class TaskPayload(EmailPayload):
    task_title: str
    task_description: str
    due_date: str
    priority: str
    committee_name: str
    task_link: str


@dataclass
class DocumentPayload(EmailPayload):
    document_title: str
    committee_name: str
    submitted_by: str
    rejection_reason: str | None = None
    document_link: str | None = None


@dataclass
class CommitteePayload(EmailPayload):
    committee_name: str
    role: str
    assigned_by: str


@dataclass
class BroadcastPayload(EmailPayload):
    subject: str
    message: str
    sent_by: str


# ── Main Email Service ─────────────────────────────────────────
class APPNAEmail:
    BRAND_COLOR = "#1e40af"
    BRAND_NAME = "APPNA"

    def __init__(self):
        # resend.api_key = settings.resend_api_key
        resend.api_key = "re_4G2T8FpK_LTipajmvNHs1bi6QzQZz1BCr"
        self.from_email = settings.from_email

    async def send(self, email_type: EmailType, payload: EmailPayload) -> dict:
        handler = self._get_handler(email_type)
        subject, html_body = handler(payload)

        try:
            response = await asyncio.to_thread(
                resend.Emails.send,
                {
                    "from": self.from_email,
                    "to": payload.to,
                    "subject": subject,
                    "html": html_body,
                }
            )
            return {"success": True, "id": response["id"], "type": email_type.value}
        except Exception as e:
            return {"success": False, "error": str(e), "type": email_type.value}

    # ── Handler Router ─────────────────────────────────────
    def _get_handler(self, email_type: EmailType):
        handlers = {
            EmailType.ACCOUNT_ACTIVATION: self._activation,
            EmailType.PASSWORD_RESET: self._password_reset,
            EmailType.EMAIL_VERIFICATION: self._email_verification,
            EmailType.WELCOME: self._welcome,
            EmailType.ACCOUNT_DEACTIVATED: self._account_deactivated,
            EmailType.MEETING_SCHEDULED: self._meeting_scheduled,
            EmailType.MEETING_UPDATED: self._meeting_updated,
            EmailType.MEETING_CANCELLED: self._meeting_cancelled,
            EmailType.MEETING_REMINDER: self._meeting_reminder,
            EmailType.MEETING_SUMMARY: self._meeting_summary,
            EmailType.TASK_ASSIGNED: self._task_assigned,
            EmailType.TASK_DUE_SOON: self._task_due_soon,
            EmailType.TASK_OVERDUE: self._task_overdue,
            EmailType.TASK_COMPLETED: self._task_completed,
            EmailType.DOCUMENT_SUBMITTED: self._document_submitted,
            EmailType.DOCUMENT_APPROVED: self._document_approved,
            EmailType.DOCUMENT_REJECTED: self._document_rejected,
            EmailType.COMMITTEE_ADDED: self._committee_added,
            EmailType.COMMITTEE_REMOVED: self._committee_removed,
            EmailType.CHAIR_ASSIGNED: self._chair_assigned,
            EmailType.BROADCAST: self._broadcast,
            EmailType.EVENT_ANNOUNCEMENT: self._event_announcement,
        }
        handler = handlers.get(email_type)
        if not handler:
            raise ValueError(f"No email handler for type: {email_type}")
        return handler

    # ── Base Template & Components (unchanged) ─────────────────
    def _base(self, content: str, preview_text: str = "") -> str:
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>{self.BRAND_NAME}</title></head>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
            <span style="display:none;max-height:0;overflow:hidden;">{preview_text}</span>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
                <tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
                        <tr>
                            <td style="background:{self.BRAND_COLOR};padding:32px 40px;text-align:center;">
                                <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">{self.BRAND_NAME}</h1>
                                <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">Association of Physicians of Pakistani Descent of North America</p>
                            </td>
                        </tr>
                        <tr><td style="padding:40px;">{content}</td></tr>
                        <tr>
                            <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
                                <p style="margin:0;color:#9ca3af;font-size:12px;">© {datetime.now().year} {self.BRAND_NAME}. All rights reserved.</p>
                                <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">This email was sent to you as a member of APPNA.</p>
                            </td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        """

    def _button(self, text: str, url: str, color: str | None = None) -> str:
        bg = color or self.BRAND_COLOR
        return f'<div style="text-align:center;margin:32px 0;"><a href="{url}" style="background:{bg};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">{text}</a></div>'

    def _badge(self, text: str, color: str) -> str:
        return f'<span style="background:{color};color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">{text}</span>'

    def _info_row(self, label: str, value: str) -> str:
        return f'<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">{label}</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">{value}</td></tr>'

    def _info_table(self, rows: list[tuple], bg: str = "#f9fafb") -> str:
        content = "".join(self._info_row(label, value) for label, value in rows)
        return f'<table width="100%" cellpadding="0" cellspacing="0" style="background:{bg};border-radius:8px;padding:20px;margin:20px 0;">{content}</table>'

    def _alert_box(self, message: str, bg: str = "#fef3c7", border: str = "#f59e0b") -> str:
        return f'<div style="background:{bg};border-left:4px solid {border};padding:16px;border-radius:6px;margin:20px 0;"><p style="margin:0;color:#111827;font-size:14px;">{message}</p></div>'

    # ═════════════════════════════════════════════════════════════
    # AUTH HANDLERS
    # ═════════════════════════════════════════════════════════════
    def _activation(self, p: ActivationPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Activate Your Account</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Welcome to APPNA, <strong>{p.name}</strong>!<br>Click below to activate your account.</p>
        {self._alert_box("This activation link expires in 24 hours.")}
        {self._button("Activate My Account", p.activation_link)}
        <p style="color:#9ca3af;font-size:13px;text-align:center;">If you did not create an account, ignore this email.</p>"""
        return "Activate Your APPNA Account", self._base(content, "Activate your account")

    def _password_reset(self, p: PasswordResetPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Reset Your Password</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, we received a password reset request.</p>
        {self._alert_box(f"Link expires in {p.expires_in}. Do not share it.")}
        {self._button("Reset Password", p.reset_link, "#dc2626")}
        <p style="color:#9ca3af;font-size:13px;text-align:center;">Didn't request this? Your account is safe. Ignore this email.</p>"""
        return "Reset Your APPNA Password", self._base(content, "Reset your password")

    def _email_verification(self, p: ActivationPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Verify Your Email</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, please verify your email address.</p>
        {self._button("Verify Email Address", p.activation_link)}"""
        return "Verify Your APPNA Email", self._base(content, "Verify your email")

    def _welcome(self, p: WelcomePayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Welcome to APPNA! 🎉</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, your account is ready.<br>You have been assigned the role of <strong>{p.role}</strong>.</p>
        <div style="background:#eff6ff;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:0;color:#1e40af;font-size:14px;font-weight:600;">You now have access to:</p>
            <ul style="color:#374151;font-size:14px;margin:10px 0 0;padding-left:20px;">
                <li>Committee management</li><li>Meeting scheduling & AI summaries</li><li>Task tracking</li><li>Document approvals</li>
            </ul>
        </div>
        {self._button("Login to Dashboard", p.login_link)}"""
        return f"Welcome to APPNA, {p.name}!", self._base(content, "Your account is ready")

    def _account_deactivated(self, p: EmailPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Account Deactivated</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, your APPNA account has been deactivated.</p>
        {self._alert_box("Your access to all APPNA resources has been revoked.", "#fee2e2", "#ef4444")}"""
        return "Your APPNA Account Has Been Deactivated", self._base(content)

    # ═════════════════════════════════════════════════════════════
    # MEETING HANDLERS (exactly as you originally wrote)
    # ═════════════════════════════════════════════════════════════
    def _meeting_info(self, p: MeetingPayload, bg: str = "#f9fafb") -> str:
        return self._info_table([
            ("📅 Date", p.meeting_date),
            ("🕐 Time", p.meeting_time),
            ("⏱ Duration", f"{p.duration_minutes} minutes"),
            ("📍 Location", p.location),
            ("🏛 Committee", p.committee_name),
        ], bg)

    def _meeting_scheduled(self, p: MeetingPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Meeting Scheduled</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 8px;">Hi <strong>{p.name}</strong>, a new meeting has been scheduled.</p>
        <h3 style="color:{self.BRAND_COLOR};font-size:18px;margin:0 0 16px;">{p.meeting_title}</h3>
        {self._meeting_info(p)}
        {self._button("View Meeting", p.meeting_link) if p.meeting_link else ""}"""
        return f"Meeting Scheduled: {p.meeting_title}", self._base(content, "New meeting scheduled")

    def _meeting_updated(self, p: MeetingPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Meeting Updated</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 8px;">Hi <strong>{p.name}</strong>, a meeting has been updated.</p>
        {self._alert_box("Please review the updated meeting details below.")}
        <h3 style="color:{self.BRAND_COLOR};font-size:18px;margin:0 0 16px;">{p.meeting_title}</h3>
        {self._meeting_info(p)}
        {self._button("View Meeting", p.meeting_link) if p.meeting_link else ""}"""
        return f"Meeting Updated: {p.meeting_title}", self._base(content, "Meeting details updated")

    def _meeting_cancelled(self, p: MeetingPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Meeting Cancelled</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 8px;">Hi <strong>{p.name}</strong>, the following meeting has been cancelled.</p>
        <h3 style="color:#dc2626;font-size:18px;margin:0 0 16px;">{p.meeting_title} {self._badge("CANCELLED", "#dc2626")}</h3>
        {self._meeting_info(p)}
        {self._alert_box(f"Reason: {p.cancellation_reason or 'No reason provided.'}", "#fee2e2", "#ef4444")}"""
        return f"Meeting Cancelled: {p.meeting_title}", self._base(content, "Meeting cancelled")

    def _meeting_reminder(self, p: MeetingPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">⏰ Meeting Reminder</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 8px;">Hi <strong>{p.name}</strong>, your meeting is coming up soon.</p>
        <h3 style="color:{self.BRAND_COLOR};font-size:18px;margin:0 0 16px;">{p.meeting_title}</h3>
        {self._meeting_info(p)}
        {self._button("Join Meeting", p.meeting_link, "#059669") if p.meeting_link else ""}"""
        return f"Reminder: {p.meeting_title}", self._base(content, "Meeting reminder")

    def _meeting_summary(self, p: MeetingPayload) -> tuple[str, str]:
        summary_block = f"""<div style="background:#eff6ff;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 8px;color:#1e40af;font-weight:600;font-size:14px;">🤖 AI Generated Summary</p>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">{p.ai_summary}</p>
        </div>""" if p.ai_summary else ""
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Meeting Summary</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 8px;">Hi <strong>{p.name}</strong>, here is the summary for the completed meeting.</p>
        <h3 style="color:{self.BRAND_COLOR};font-size:18px;margin:0 0 16px;">{p.meeting_title} {self._badge("COMPLETED", "#059669")}</h3>
        {self._meeting_info(p, "#f0fdf4")}
        {summary_block}
        {self._button("View Full Minutes", p.meeting_link) if p.meeting_link else ""}"""
        return f"Summary: {p.meeting_title}", self._base(content, "Meeting summary available")

    # (All remaining handlers — Task, Document, Committee, Broadcast — are included below)
    # Task handlers
    def _task_info(self, p: TaskPayload) -> str:
        colors = {"urgent": "#dc2626", "high": "#ea580c", "medium": "#d97706", "low": "#059669"}
        color = colors.get(p.priority.lower(), "#6b7280")
        return self._info_table([
            ("📋 Task", p.task_title),
            ("🏛 Committee", p.committee_name),
            ("📅 Due Date", p.due_date),
            ("🚦 Priority", f'<span style="color:{color};font-weight:600;">{p.priority.upper()}</span>'),
        ])

    def _task_assigned(self, p: TaskPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">New Task Assigned</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, a new task has been assigned to you.</p>
        {self._task_info(p)}
        <p style="color:#374151;font-size:14px;margin:16px 0;"><strong>Description:</strong> {p.task_description}</p>
        {self._button("View Task", p.task_link)}"""
        return f"New Task: {p.task_title}", self._base(content, "You have a new task")

    def _task_due_soon(self, p: TaskPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Task Due Soon ⏰</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, a task is due soon.</p>
        {self._alert_box(f"Due on {p.due_date}. Please complete it on time.")}
        {self._task_info(p)}
        {self._button("View Task", p.task_link, "#d97706")}"""
        return f"Due Soon: {p.task_title}", self._base(content, "Task due soon")

    def _task_overdue(self, p: TaskPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#dc2626;font-size:22px;margin:0 0 8px;">Task Overdue ❗</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, the following task is overdue.</p>
        {self._alert_box(f"Was due on {p.due_date} and has not been completed.", "#fee2e2", "#ef4444")}
        {self._task_info(p)}
        {self._button("Complete Task Now", p.task_link, "#dc2626")}"""
        return f"OVERDUE: {p.task_title}", self._base(content, "Overdue task")

    def _task_completed(self, p: TaskPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#059669;font-size:22px;margin:0 0 8px;">Task Completed ✅</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, a task has been marked as completed.</p>
        {self._task_info(p)}"""
        return f"Completed: {p.task_title}", self._base(content, "Task completed")

    # Document handlers
    def _document_submitted(self, p: DocumentPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Document Submitted for Approval</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, a document needs your approval.</p>
        {self._info_table([("📄 Document", p.document_title), ("🏛 Committee", p.committee_name), ("👤 Submitted By", p.submitted_by)])} 
        {self._button("Review Document", p.document_link) if p.document_link else ""}"""
        return f"Approval Required: {p.document_title}", self._base(content, "Document awaiting approval")

    def _document_approved(self, p: DocumentPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#059669;font-size:22px;margin:0 0 8px;">Document Approved ✅</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, your document has been approved.</p>
        {self._info_table([("📄 Document", p.document_title), ("🏛 Committee", p.committee_name)], "#f0fdf4")}
        {self._button("View Document", p.document_link) if p.document_link else ""}"""
        return f"Approved: {p.document_title}", self._base(content, "Document approved")

    def _document_rejected(self, p: DocumentPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#dc2626;font-size:22px;margin:0 0 8px;">Document Rejected</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, your document has been rejected.</p>
        {self._info_table([("📄 Document", p.document_title), ("🏛 Committee", p.committee_name)], "#fef2f2")}
        {self._alert_box(f"Reason: {p.rejection_reason or 'No reason provided.'}", "#fee2e2", "#ef4444")}
        {self._button("Revise Document", p.document_link, "#dc2626") if p.document_link else ""}"""
        return f"Rejected: {p.document_title}", self._base(content, "Document needs revision")

    # Committee handlers
    def _committee_added(self, p: CommitteePayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Added to Committee</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, you have been added to a committee.</p>
        {self._info_table([("🏛 Committee", p.committee_name), ("👤 Your Role", p.role), ("✅ Added By", p.assigned_by)], "#eff6ff")}"""
        return f"Added to {p.committee_name}", self._base(content, "Added to committee")

    def _committee_removed(self, p: CommitteePayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Removed from Committee</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, you have been removed from a committee.</p>
        {self._info_table([("🏛 Committee", p.committee_name), ("✅ Removed By", p.assigned_by)])}"""
        return f"Removed from {p.committee_name}", self._base(content, "Committee membership update")

    def _chair_assigned(self, p: CommitteePayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">You are now Committee Chair 🎉</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Congratulations <strong>{p.name}</strong>! You have been assigned as the Chair of <strong>{p.committee_name}</strong>.</p>
        {self._info_table([("🏛 Committee", p.committee_name), ("👑 Role", "Committee Chair"), ("✅ Assigned By", p.assigned_by)], "#eff6ff")}"""
        return f"You're now Chair of {p.committee_name}", self._base(content, "Chair assignment")

    # Announcement handlers
    def _broadcast(self, p: BroadcastPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">📢 Announcement</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, you have a new announcement from APPNA leadership.</p>
        <div style="background:#f9fafb;border-radius:8px;padding:24px;margin:20px 0;border-left:4px solid {self.BRAND_COLOR};">
            <h3 style="margin:0 0 12px;color:#111827;font-size:16px;">{p.subject}</h3>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">{p.message}</p>
        </div>
        <p style="color:#9ca3af;font-size:13px;">Sent by: {p.sent_by}</p>"""
        return p.subject, self._base(content, p.subject)

    def _event_announcement(self, p: BroadcastPayload) -> tuple[str, str]:
        content = f"""<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">🎉 Event Announcement</h2>
        <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Hi <strong>{p.name}</strong>, APPNA has a new event for you.</p>
        <div style="background:#eff6ff;border-radius:8px;padding:24px;margin:20px 0;">
            <h3 style="margin:0 0 12px;color:{self.BRAND_COLOR};font-size:18px;">{p.subject}</h3>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">{p.message}</p>
        </div>
        <p style="color:#9ca3af;font-size:13px;">From: {p.sent_by}</p>"""
        return p.subject, self._base(content, p.subject)
