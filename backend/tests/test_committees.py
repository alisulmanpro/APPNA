import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import get_db


# ── Helpers ────────────────────────────────────────────────────
def make_fake_committee(**kwargs):
    committee = MagicMock()
    committee.id = kwargs.get("id", uuid.uuid4())
    committee.name = kwargs.get("name", "Education Committee")
    committee.description = kwargs.get("description", "Handles education")
    committee.is_active = kwargs.get("is_active", True)
    committee.chair_id = kwargs.get("chair_id", None)
    committee.created_at = kwargs.get("created_at", "2026-01-01T00:00:00+00:00")
    committee.updated_at = kwargs.get("updated_at", "2026-01-01T00:00:00+00:00")
    committee.members = kwargs.get("members", [])
    return committee


def make_fake_user(**kwargs):
    user = MagicMock()
    user.id = kwargs.get("id", uuid.uuid4())
    user.first_name = kwargs.get("first_name", "Ahmed")
    user.last_name = kwargs.get("last_name", "Khan")
    user.is_active = kwargs.get("is_active", True)
    return user


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


@pytest.fixture
def committee_payload():
    return {
        "name": "Education Committee",
        "description": "Handles education programs",
    }


# ── Create committee tests ─────────────────────────────────────
@pytest.mark.asyncio
async def test_create_committee_success(committee_payload, mock_db):
    fake_committee = make_fake_committee(**committee_payload)

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def fake_refresh(obj):
        obj.id = fake_committee.id
        obj.name = fake_committee.name
        obj.description = fake_committee.description
        obj.is_active = True
        obj.chair_id = None
        obj.created_at = "2026-01-01T00:00:00+00:00"

    mock_db.refresh = fake_refresh

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/committees", json=committee_payload)

    app.dependency_overrides = {}
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_create_committee_duplicate_name(committee_payload, mock_db):
    fake_committee = make_fake_committee(**committee_payload)

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_committee
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/committees", json=committee_payload)

    app.dependency_overrides = {}
    assert response.status_code == 409


# ── Update committee tests ─────────────────────────────────────
@pytest.mark.asyncio
async def test_update_committee_success(mock_db):
    fake_committee = make_fake_committee()

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_committee
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/committees/{uuid.uuid4()}",
            json={"description": "Updated description"}
        )

    app.dependency_overrides = {}
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_update_committee_not_found(mock_db):
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
            f"/api/v1/committees/{uuid.uuid4()}",
            json={"description": "Updated description"}
        )

    app.dependency_overrides = {}
    assert response.status_code == 404


# ── Delete committee tests ─────────────────────────────────────
@pytest.mark.asyncio
async def test_delete_committee_success(mock_db):
    fake_committee = make_fake_committee()

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_committee
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.delete(f"/api/v1/committees/{uuid.uuid4()}")

    app.dependency_overrides = {}
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_committee_not_found(mock_db):
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
        response = await client.delete(f"/api/v1/committees/{uuid.uuid4()}")

    app.dependency_overrides = {}
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_already_deactivated_committee(mock_db):
    fake_committee = make_fake_committee(is_active=False)

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_committee
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.delete(f"/api/v1/committees/{uuid.uuid4()}")

    app.dependency_overrides = {}
    assert response.status_code == 409


# ── View committee tests ───────────────────────────────────────
@pytest.mark.asyncio
async def test_view_committee_success(mock_db):
    fake_committee = make_fake_committee()

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_committee
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.get(f"/api/v1/committees/{uuid.uuid4()}")

    app.dependency_overrides = {}
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_view_committee_not_found(mock_db):
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
        response = await client.get(f"/api/v1/committees/{uuid.uuid4()}")

    app.dependency_overrides = {}
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_view_deactivated_committee(mock_db):
    fake_committee = make_fake_committee(is_active=False)

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_committee
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.get(f"/api/v1/committees/{uuid.uuid4()}")

    app.dependency_overrides = {}
    assert response.status_code == 410


# ── Assign chair tests ─────────────────────────────────────────
@pytest.mark.asyncio
async def test_assign_chair_success(mock_db):
    fake_committee = make_fake_committee()
    fake_user = make_fake_user()

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.side_effect = [fake_committee, fake_user]
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.patch(
            f"/api/v1/committees/{uuid.uuid4()}/assign-chair",
            json={"chair_id": str(uuid.uuid4())}
        )

    app.dependency_overrides = {}
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_assign_chair_committee_not_found(mock_db):
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
            f"/api/v1/committees/{uuid.uuid4()}/assign-chair",
            json={"chair_id": str(uuid.uuid4())}
        )

    app.dependency_overrides = {}
    assert response.status_code == 404


# ── Remove member tests ────────────────────────────────────────
@pytest.mark.asyncio
async def test_remove_member_not_found_committee(mock_db):
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
        response = await client.delete(
            f"/api/v1/committees/{uuid.uuid4()}/members/{uuid.uuid4()}"
        )

    app.dependency_overrides = {}
    assert response.status_code == 404
