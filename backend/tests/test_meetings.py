import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import get_db


# ── Helpers ────────────────────────────────────────────────────
def make_fake_meeting(**kwargs):
    meeting = MagicMock()
    meeting.id = kwargs.get("id", uuid.uuid4())
    meeting.title = kwargs.get("title", "Test Meeting")
    meeting.description = kwargs.get("description", "Test Description")
    meeting.location = kwargs.get("location", "Zoom")
    meeting.scheduled_at = kwargs.get("scheduled_at", "2030-01-01T10:00:00+00:00")
    meeting.duration_minutes = kwargs.get("duration_minutes", 60)
    meeting.status = kwargs.get("status", "scheduled")
    meeting.committee_id = kwargs.get("committee_id", None)
    meeting.scheduled_by_id = kwargs.get("scheduled_by_id", None)
    meeting.transcript = kwargs.get("transcript", None)
    meeting.ai_summary = kwargs.get("ai_summary", None)
    meeting.minutes = kwargs.get("minutes", None)
    meeting.created_at = kwargs.get("created_at", "2026-01-01T00:00:00+00:00")
    return meeting


def make_fake_user(**kwargs):
    user = MagicMock()
    user.id = kwargs.get("id", uuid.uuid4())
    user.first_name = kwargs.get("first_name", "Ahmed")
    user.last_name = kwargs.get("last_name", "Khan")
    user.is_active = kwargs.get("is_active", True)
    return user


def make_fake_document(**kwargs):
    doc = MagicMock()
    doc.id = kwargs.get("id", uuid.uuid4())
    doc.title = kwargs.get("title", "Test Document")
    doc.status = kwargs.get("status", "draft")
    return doc


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


@pytest.fixture
def meeting_payload():
    return {
        "title": "Education Committee Meeting",
        "description": "Quarterly review",
        "location": "Zoom",
        "scheduled_at": "2030-06-01T10:00:00+00:00",
        "duration_minutes": 60,
    }


async def override_db(mock_db):
    async def _override():
        yield mock_db

    return _override


# ── Schedule meeting tests ─────────────────────────────────────
@pytest.mark.asyncio
async def test_schedule_meeting_success(meeting_payload, mock_db):
    fake_meeting = make_fake_meeting(**meeting_payload)

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    # ── refresh must populate the object ──────────────
    async def fake_refresh(obj):
        obj.id = fake_meeting.id
        obj.title = fake_meeting.title
        obj.description = fake_meeting.description
        obj.location = fake_meeting.location
        obj.scheduled_at = fake_meeting.scheduled_at
        obj.duration_minutes = fake_meeting.duration_minutes
        obj.status = "scheduled"
        obj.committee_id = None
        obj.scheduled_by_id = None
        obj.ai_summary = None
        obj.minutes = None
        obj.created_at = "2026-01-01T00:00:00+00:00"

    mock_db.refresh = fake_refresh

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/meetings", json=meeting_payload)

    app.dependency_overrides = {}
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_schedule_meeting_past_date(meeting_payload, mock_db):
    meeting_payload["scheduled_at"] = "2020-01-01T10:00:00+00:00"

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/meetings", json=meeting_payload)

    app.dependency_overrides = {}
    assert response.status_code == 400


# ── Update meeting tests ───────────────────────────────────────
@pytest.mark.asyncio
async def test_update_meeting_success(mock_db):
    fake_meeting = make_fake_meeting()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_meeting
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}",
            json={"title": "Updated Title"}
        )

    app.dependency_overrides = {}
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_update_meeting_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}",
            json={"title": "Updated Title"}
        )

    app.dependency_overrides = {}
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_cancelled_meeting(mock_db):
    fake_meeting = make_fake_meeting(status="cancelled")
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_meeting
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}",
            json={"title": "Updated Title"}
        )

    app.dependency_overrides = {}
    assert response.status_code == 400


# ── Cancel meeting tests ───────────────────────────────────────
@pytest.mark.asyncio
async def test_cancel_meeting_success(mock_db):
    fake_meeting = make_fake_meeting()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_meeting
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}/cancel",
            json={"reason": "Speaker unavailable"}
        )

    app.dependency_overrides = {}
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_cancel_already_cancelled_meeting(mock_db):
    fake_meeting = make_fake_meeting(status="cancelled")
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_meeting
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}/cancel",
            json={}
        )

    app.dependency_overrides = {}
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_cancel_completed_meeting(mock_db):
    fake_meeting = make_fake_meeting(status="completed")
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_meeting
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}/cancel",
            json={}
        )

    app.dependency_overrides = {}
    assert response.status_code == 400


# ── Store transcript tests ─────────────────────────────────────
@pytest.mark.asyncio
async def test_store_transcript_success(mock_db):
    fake_meeting = make_fake_meeting()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_meeting
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}/transcript",
            json={"transcript": "Meeting started at 10:00 AM..."}
        )

    app.dependency_overrides = {}
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_store_transcript_cancelled_meeting(mock_db):
    fake_meeting = make_fake_meeting(status="cancelled")
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_meeting
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}/transcript",
            json={"transcript": "Some transcript"}
        )

    app.dependency_overrides = {}
    assert response.status_code == 400


# ── Save minutes tests ─────────────────────────────────────────
@pytest.mark.asyncio
async def test_save_minutes_success(mock_db):
    fake_meeting = make_fake_meeting(transcript="Existing transcript")
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_meeting
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}/minutes",
            json={"minutes": "1. Budget approved. 2. Next meeting set."}
        )

    app.dependency_overrides = {}
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_save_minutes_without_transcript(mock_db):
    fake_meeting = make_fake_meeting(transcript=None)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_meeting
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}/minutes",
            json={"minutes": "Some minutes"}
        )

    app.dependency_overrides = {}
    assert response.status_code == 400


# ── Meeting not found tests ────────────────────────────────────
@pytest.mark.asyncio
async def test_cancel_meeting_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}/cancel",
            json={}
        )

    app.dependency_overrides = {}
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_store_transcript_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/meetings/{uuid.uuid4()}/transcript",
            json={"transcript": "Some transcript"}
        )

    app.dependency_overrides = {}
    assert response.status_code == 404
