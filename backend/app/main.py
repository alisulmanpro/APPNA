from fastapi import FastAPI
from app.api.v2.endpoints import health

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

app.include_router(health.health_check)
