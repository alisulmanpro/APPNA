import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport
from app.main import app


# ── Fake member object ─────────────────────────────────────────
def make_fake_member(**kwargs):
    member = MagicMock()
    member.id = uuid.uuid4()
    member.email = kwargs.get("email", "test@appna.org")
    member.first_name = kwargs.get("first_name", "Ahmed")
    member.last_name = kwargs.get("last_name", "Khan")
    member.phone = kwargs.get("phone", "+923001234567")
    member.location = kwargs.get("location", "Karachi")
    member.role = kwargs.get("role", "member")
    member.is_active = kwargs.get("is_active", True)
    member.is_email_verified = kwargs.get("is_email_verified", False)
    return member


# ── Fixtures ───────────────────────────────────────────────────
@pytest.fixture
def member_payload():
    return {
        "email": "test@appna.org",
        "password": "Test1234!",
        "first_name": "Ahmed",
        "last_name": "Khan",
        "phone": "+923001234567",
        "location": "Karachi",
        "role": "member"
    }


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


# ── Add member tests ───────────────────────────────────────────
@pytest.mark.asyncio
async def test_add_member_success(member_payload, mock_db):
    fake_member = make_fake_member(**member_payload)

    # no existing member found
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.refresh = AsyncMock(side_effect=lambda m: None)

    with patch("app.api.v1.endpoints.crm.add_member.get_db", return_value=mock_db), \
            patch("app.core.database.get_db", return_value=mock_db):
        async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test"
        ) as client:
            with patch("app.api.v1.endpoints.crm.add_member.get_db") as mock_get_db:
                mock_get_db.return_value = mock_db

                async def override_get_db():
                    yield mock_db

                app.dependency_overrides = {}
                from app.core.database import get_db
                app.dependency_overrides[get_db] = override_get_db

                response = await client.post("/api/v1/add-members", json=member_payload)

    app.dependency_overrides = {}
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_add_member_duplicate_email(member_payload, mock_db):
    fake_member = make_fake_member(**member_payload)

    # existing member found → should return 409
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_member
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override_get_db():
        yield mock_db

    from app.core.database import get_db
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/add-members", json=member_payload)

    app.dependency_overrides = {}
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_add_member_short_password(member_payload, mock_db):
    member_payload["password"] = "123"

    async def override_get_db():
        yield mock_db

    from app.core.database import get_db
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/add-members", json=member_payload)

    app.dependency_overrides = {}
    assert response.status_code == 422


# ── View member tests ──────────────────────────────────────────
@pytest.mark.asyncio
async def test_view_member_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override_get_db():
        yield mock_db

    from app.core.database import get_db
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.get(
            f"/api/v1/members/{uuid.uuid4()}"
        )

    app.dependency_overrides = {}
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_view_member_deactivated(mock_db):
    fake_member = make_fake_member(is_active=False)

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_member
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override_get_db():
        yield mock_db

    from app.core.database import get_db
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.get(f"/api/v1/members/{uuid.uuid4()}")

    app.dependency_overrides = {}
    assert response.status_code == 410


# ── Delete member tests ────────────────────────────────────────
@pytest.mark.asyncio
async def test_delete_member_not_found(mock_db):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override_get_db():
        yield mock_db

    from app.core.database import get_db
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as client:
        response = await client.delete(f"/api/v1/members/{uuid.uuid4()}")

    app.dependency_overrides = {}
    assert response.status_code == 404
