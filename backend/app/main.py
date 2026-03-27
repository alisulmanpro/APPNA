import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

app = FastAPI(
    title="APPNA AI Command Center",
    description="""
Central management system for **Association of Physicians of Pakistani Descent of North America**.

### Modules
- **Members** — CRM directory of 370+ members
- **Committees** — 33 committees management
- **Tasks** — Accountability & task tracking
- **Meetings** — AI-powered meeting summaries
- **Documents** — Approvals & document center
- **Events** — Convention & event management

### Auth
All protected routes require `Bearer` JWT token.
    """,
    version="0.1.0",
    contact={
        "name": "APPNA Tech Team",
        "email": "tech@appna.org",
    },
    license_info={
        "name": "Private — APPNA Internal Use Only",
    },
    docs_url="/docs",
    redoc_url="/redoc",
)

load_dotenv()

# ── CORS ──────────────────────────────────────────────────────
allowed_origins = [
    "http://localhost:3000",  # Next.js dev (adjust port if using Vite: 5173)
    "http://localhost:5173",
]

# Production origin from env (remove trailing slash!)
prod_origin = os.getenv("ACCEPT_URL")
if prod_origin:
    # Normalize: remove trailing slash if present
    prod_origin = prod_origin.rstrip("/")
    allowed_origins.append(prod_origin)
else:
    # Fallback during debug – never leave "*" in production!
    print("WARNING: ACCEPT_URL not set → using wildcard for debug only")
    allowed_origins.append("*")  # ← temporary debug only

print("Allowed CORS origins:", allowed_origins)  # ← see this in Railway logs!

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Main Router ───────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "Hello World"}


# ── Health Router ───────────────────────────────────────────────────────
from app.api.v2.endpoints.health import router as health_check_router

app.include_router(health_check_router, prefix="/api/v2", tags=["Health Router"])


# ── CRM ───────────────────────────────────────────────────────
from app.api.v1.endpoints.crm.add_member import router as add_member_router
from app.api.v1.endpoints.crm.update_member import router as update_member_router
from app.api.v1.endpoints.crm.delete_member import router as delete_member_router
from app.api.v1.endpoints.crm.view_member import router as view_member_router
from app.api.v1.endpoints.crm.list_members import router as list_members_router
from app.api.v1.endpoints.crm.search_members import router as search_members_router
from app.api.v1.endpoints.crm.filter_members import router as filter_members_router
from app.api.v1.endpoints.crm.export_members import router as export_members_router
from app.api.v1.endpoints.crm.import_members import router as import_members_router

app.include_router(add_member_router, prefix="/api/v1", tags=["CRM"])
app.include_router(update_member_router, prefix="/api/v1", tags=["CRM"])
app.include_router(delete_member_router, prefix="/api/v1", tags=["CRM"])
app.include_router(list_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(import_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(export_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(filter_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(search_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(view_member_router, prefix="/api/v1", tags=["CRM"])

# ── Committees ───────────────────────────────────────────────────────
from app.api.v1.endpoints.committees.create_committee import router as create_committee_router
from app.api.v1.endpoints.committees.update_committee import router as update_committee_router
from app.api.v1.endpoints.committees.delete_committee import router as delete_committee_router
from app.api.v1.endpoints.committees.list_committees import router as list_committees_router
from app.api.v1.endpoints.committees.view_committee import router as view_committee_router
from app.api.v1.endpoints.committees.assign_chair import router as assign_chair_router
from app.api.v1.endpoints.committees.add_committee_member import router as add_committee_member_router
from app.api.v1.endpoints.committees.remove_committee_member import router as remove_committee_member_router
from app.api.v1.endpoints.committees.committee_activity import router as committee_activity_router

app.include_router(create_committee_router, prefix="/api/v1", tags=["Committees"])
app.include_router(update_committee_router, prefix="/api/v1", tags=["Committees"])
app.include_router(delete_committee_router, prefix="/api/v1", tags=["Committees"])
app.include_router(view_committee_router, prefix="/api/v1", tags=["Committees"])
app.include_router(list_committees_router, prefix="/api/v1", tags=["Committees"])
app.include_router(assign_chair_router, prefix="/api/v1", tags=["Committees"])
app.include_router(add_committee_member_router, prefix="/api/v1", tags=["Committees"])
app.include_router(remove_committee_member_router, prefix="/api/v1", tags=["Committees"])
app.include_router(committee_activity_router, prefix="/api/v1", tags=["Committees"])

# ── Meetings ───────────────────────────────────────────────────────
from app.api.v1.endpoints.meetings.schedule_meeting import router as schedule_meeting_router
from app.api.v1.endpoints.meetings.update_meeting import router as update_meeting_router
from app.api.v1.endpoints.meetings.cancel_meeting import router as cancel_meeting_router
from app.api.v1.endpoints.meetings.add_participants import router as add_participants_router
from app.api.v1.endpoints.meetings.store_transcript import router as store_transcript_router
from app.api.v1.endpoints.meetings.save_minutes import router as save_minutes_router
from app.api.v1.endpoints.meetings.attach_documents import router as attach_documents_router
from app.api.v1.endpoints.meetings.meeting_history import router as meeting_history_router

app.include_router(schedule_meeting_router, prefix="/api/v1", tags=["Meetings"])
app.include_router(update_meeting_router, prefix="/api/v1", tags=["Meetings"])
app.include_router(cancel_meeting_router, prefix="/api/v1", tags=["Meetings"])
app.include_router(add_participants_router, prefix="/api/v1", tags=["Meetings"])
app.include_router(store_transcript_router, prefix="/api/v1", tags=["Meetings"])
app.include_router(save_minutes_router, prefix="/api/v1", tags=["Meetings"])
app.include_router(attach_documents_router, prefix="/api/v1", tags=["Meetings"])
app.include_router(meeting_history_router, prefix="/api/v1", tags=["Meetings"])

# ── Auth ───────────────────────────────────────────────────────
from app.api.v1.endpoints.auth.register import router as register_router
from app.api.v1.endpoints.auth.login import router as login_router
from app.api.v1.endpoints.auth.refresh import router as refresh_router
from app.api.v1.endpoints.auth.logout import router as logout_router
from app.api.v1.endpoints.auth.me import router as me_router
from app.api.v1.endpoints.auth.change_password import router as change_password_router
from app.api.v1.endpoints.auth.reset_password import router as reset_password_router
from app.api.v1.endpoints.auth.verify_email import router as verify_email_router
from app.api.v1.endpoints.auth.account_status import router as account_status_router

app.include_router(register_router, prefix="/api/v1", tags=["Auth"])
app.include_router(login_router, prefix="/api/v1", tags=["Auth"])
app.include_router(refresh_router, prefix="/api/v1", tags=["Auth"])
app.include_router(logout_router, prefix="/api/v1", tags=["Auth"])
app.include_router(me_router, prefix="/api/v1", tags=["Auth"])
app.include_router(change_password_router, prefix="/api/v1", tags=["Auth"])
app.include_router(reset_password_router, prefix="/api/v1", tags=["Auth"])
app.include_router(verify_email_router, prefix="/api/v1", tags=["Auth"])
app.include_router(account_status_router, prefix="/api/v1", tags=["Auth"])

# ── Email ───────────────────────────────────────────────────────
from app.api.v1.endpoints.email.email_services import router as email_services_router

app.include_router(email_services_router, prefix="/api/v1", tags=["Email"])