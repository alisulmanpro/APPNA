# APPNA Backend — Functionality Plan

> **My honest take:** The previous AI listed 114 features. That list will kill your project.  
> We build **what is actually needed**, in the order that matters. Cut the fluff.

---

## ⚠️ Reality Check First

| Previous AI Suggested | My Verdict |
|---|---|
| MongoDB | ❌ Wrong DB for this |
| 114 features all at once | ❌ Project graveyard |
| AI in early phase | ❌ Build core first |
| Data backup/restore as feature | ❌ That's DevOps, not backend code |

---

## ✅ What We Actually Build — 78 Functionalities

Grouped by **build order**, not just category.

---

## Phase 1 — Foundation (Build First, Everything Depends On This)

### 1️⃣ Authentication & Authorization — 9 features

| # | Feature | Priority |
|---|---|---|
| 1 | User registration | 🔴 Must |
| 2 | User login (JWT) | 🔴 Must |
| 3 | Refresh token | 🔴 Must |
| 4 | Logout / token invalidation | 🔴 Must |
| 5 | Role-based access (President, Admin, Chair, Member) | 🔴 Must |
| 6 | Change password | 🔴 Must |
| 7 | Password reset via email | 🟡 Should |
| 8 | Email verification | 🟡 Should |
| 9 | Account activate / deactivate | 🟡 Should |

> ❌ **Dropped from previous list:** "Permission management for modules" — RBAC covers this already. Don't over-engineer.

---

### 2️⃣ Member CRM — 9 features

| # | Feature | Priority |
|---|---|---|
| 10 | Add member | 🔴 Must |
| 11 | Update member | 🔴 Must |
| 12 | Delete member (soft delete) | 🔴 Must |
| 13 | View member profile | 🔴 Must |
| 14 | List all members (paginated) | 🔴 Must |
| 15 | Search members | 🔴 Must |
| 16 | Filter by committee / location / role | 🟡 Should |
| 17 | Import members via CSV | 🟡 Should |
| 18 | Export member data (CSV) | 🟡 Should |

> ❌ **Dropped:** "Member activity tracking" — this is a dashboard aggregation, not a standalone feature.

---

### 3️⃣ Committee Management — 9 features

| # | Feature | Priority |
|---|---|---|
| 19 | Create committee | 🔴 Must |
| 20 | Update committee | 🔴 Must |
| 21 | Delete committee (soft delete) | 🔴 Must |
| 22 | List committees | 🔴 Must |
| 23 | View committee details | 🔴 Must |
| 24 | Assign committee chair | 🔴 Must |
| 25 | Add member to committee | 🔴 Must |
| 26 | Remove member from committee | 🔴 Must |
| 27 | Committee activity history | 🟡 Should |

---

## Phase 2 — Core Operations

### 4️⃣ Task Management — 11 features

| # | Feature | Priority |
|---|---|---|
| 28 | Create task | 🔴 Must |
| 29 | Assign task to member / committee | 🔴 Must |
| 30 | Update task | 🔴 Must |
| 31 | Delete task | 🔴 Must |
| 32 | Change task status (Pending / In Progress / Done) | 🔴 Must |
| 33 | Set due date + priority | 🔴 Must |
| 34 | Overdue task detection | 🔴 Must |
| 35 | Task comments | 🟡 Should |
| 36 | Task attachment upload | 🟡 Should |
| 37 | Task history log | 🟡 Should |
| 38 | Task notifications (via background job) | 🟡 Should |

> ❌ **Dropped:** "Smart task suggestions" — AI feature, Phase 4.  
> ❌ **Dropped:** "Task progress %" — overcomplicated for this org size.

---

### 5️⃣ Document & Approvals — 10 features

| # | Feature | Priority |
|---|---|---|
| 39 | Upload document (S3/R2) | 🔴 Must |
| 40 | Delete document | 🔴 Must |
| 41 | Assign document to committee | 🔴 Must |
| 42 | Submit document for approval | 🔴 Must |
| 43 | Approve document | 🔴 Must |
| 44 | Reject document (with reason) | 🔴 Must |
| 45 | Document status tracking | 🔴 Must |
| 46 | Document search | 🟡 Should |
| 47 | Document download (signed S3 URL) | 🟡 Should |
| 48 | Document version control | 🟡 Should |

> ❌ **Dropped:** "Document activity log" — covered by audit log in Admin.

---

### 6️⃣ Meeting Management — 9 features

| # | Feature | Priority |
|---|---|---|
| 49 | Schedule meeting | 🔴 Must |
| 50 | Update meeting | 🔴 Must |
| 51 | Cancel meeting | 🔴 Must |
| 52 | Add participants | 🔴 Must |
| 53 | Store meeting transcript | 🔴 Must |
| 54 | Save meeting minutes | 🔴 Must |
| 55 | Attach documents to meeting | 🟡 Should |
| 56 | Meeting history | 🟡 Should |
| 57 | Meeting reminders (background job) | 🟡 Should |

---

## Phase 3 — Dashboard & Notifications

### 7️⃣ Dashboard (Command Center) — 7 features

| # | Feature | Priority |
|---|---|---|
| 58 | Overall statistics (members, committees, tasks) | 🔴 Must |
| 59 | Committee health status | 🔴 Must |
| 60 | Pending approvals count | 🔴 Must |
| 61 | Overdue tasks count | 🔴 Must |
| 62 | Upcoming events summary | 🔴 Must |
| 63 | Recent activity feed | 🟡 Should |
| 64 | Broadcast announcements | 🟡 Should |

> Dashboard is **read-only aggregation** — no writes here, only fast SELECTs.

---

### 8️⃣ Notifications — 6 features

| # | Feature | Priority |
|---|---|---|
| 65 | In-app notifications (DB-based) | 🔴 Must |
| 66 | Mark notification as read | 🔴 Must |
| 67 | Email notifications via Resend | 🔴 Must |
| 68 | Task reminder notifications | 🟡 Should |
| 69 | Approval notifications | 🟡 Should |
| 70 | Meeting reminder notifications | 🟡 Should |

---

## Phase 4 — Events & AI

### 9️⃣ Event / Convention Management — 8 features

| # | Feature | Priority |
|---|---|---|
| 71 | Create event | 🔴 Must |
| 72 | Update / delete event | 🔴 Must |
| 73 | Event schedule management | 🔴 Must |
| 74 | Attendee registration | 🔴 Must |
| 75 | Vendor management | 🟡 Should |
| 76 | Budget tracking | 🟡 Should |
| 77 | Event announcements | 🟡 Should |
| 78 | Event reporting | 🟡 Should |

---

### 🤖 AI Features — Phase 5 (Last)

| # | Feature | Notes |
|---|---|---|
| A | Meeting transcript summarization | Claude API + arq background job |
| B | Action item extraction from transcript | Claude API |
| C | Document summarization | Claude API |
| D | Committee performance insights | Claude API |

> AI is Phase 5. You cannot build AI on top of broken core features.  
> These are **bonus**, not foundation.

---

## 📊 Final Count

| Module | Count | Phase |
|---|---|---|
| Auth | 9 | 1 |
| Member CRM | 9 | 1 |
| Committees | 9 | 1 |
| Tasks | 11 | 2 |
| Documents | 10 | 2 |
| Meetings | 9 | 2 |
| Dashboard | 7 | 3 |
| Notifications | 6 | 3 |
| Events | 8 | 4 |
| AI (bonus) | 4 | 5 |
| **Total** | **78** | — |

---

## 🗑️ What I Cut vs Previous AI & Why

| Removed Feature | Reason |
|---|---|
| Data backup / restore | DevOps job, not API endpoint |
| System monitoring | Use Grafana / UptimeRobot |
| MongoDB schema | Wrong database |
| "Smart task suggestions" | Premature AI feature |
| Permission management module | RBAC roles cover this |
| Task progress % tracking | Overkill for 370 members |
| Report export PDF | Phase 5+ only |

---

## ⚠️ One Rule For This Build

> **Never start a new module until the previous one is working, tested, and clean.**  
> 78 features built properly > 114 features built halfway.

---

*Functionality Plan v1.0 | APPNA AI Command Center*