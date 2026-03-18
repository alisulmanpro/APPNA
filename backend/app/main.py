from fastapi import FastAPI

from app.api.v2.endpoints.health import router as health_check_router

from app.api.v1.endpoints.crm.add_member import router as add_member_router
from app.api.v1.endpoints.crm.update_member import router as update_member_router
from app.api.v1.endpoints.crm.delete_member import router as delete_member_router
from app.api.v1.endpoints.crm.view_member import router as view_member_router
from app.api.v1.endpoints.crm.list_members import router as list_members_router
from app.api.v1.endpoints.crm.search_members import router as search_members_router
from app.api.v1.endpoints.crm.filter_members import router as filter_members_router
from app.api.v1.endpoints.crm.export_members import router as export_members_router
from app.api.v1.endpoints.crm.import_members import router as import_members_router

from app.api.v1.endpoints.committees.create_committee import router as create_committee_router
from app.api.v1.endpoints.committees.update_committee import router as update_committee_router
from app.api.v1.endpoints.committees.delete_committee import router as delete_committee_router
from app.api.v1.endpoints.committees.list_committees import router as list_committees_router
from app.api.v1.endpoints.committees.view_committee import router as view_committee_router
from app.api.v1.endpoints.committees.assign_chair import router as assign_chair_router
from app.api.v1.endpoints.committees.add_committee_member import router as add_committee_member_router
from app.api.v1.endpoints.committees.remove_committee_member import router as remove_committee_member_router
from app.api.v1.endpoints.committees.committee_activity import router as committee_activity_router

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

app.include_router(health_check_router)

# ── CRM ───────────────────────────────────────────────────────
app.include_router(add_member_router, prefix="/api/v1", tags=["CRM"])
app.include_router(update_member_router, prefix="/api/v1", tags=["CRM"])
app.include_router(delete_member_router, prefix="/api/v1", tags=["CRM"])
app.include_router(list_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(import_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(export_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(filter_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(search_members_router, prefix="/api/v1", tags=["CRM"])
app.include_router(view_member_router, prefix="/api/v1", tags=["CRM"])

# ── CRM ───────────────────────────────────────────────────────
app.include_router(create_committee_router, prefix="/api/v1", tags=["Committees"])
app.include_router(update_committee_router, prefix="/api/v1", tags=["Committees"])
app.include_router(delete_committee_router, prefix="/api/v1", tags=["Committees"])
app.include_router(view_committee_router, prefix="/api/v1", tags=["Committees"])
app.include_router(list_committees_router, prefix="/api/v1", tags=["Committees"])
app.include_router(assign_chair_router, prefix="/api/v1", tags=["Committees"])
app.include_router(add_committee_member_router, prefix="/api/v1", tags=["Committees"])
app.include_router(remove_committee_member_router, prefix="/api/v1", tags=["Committees"])
app.include_router(committee_activity_router, prefix="/api/v1", tags=["Committees"])