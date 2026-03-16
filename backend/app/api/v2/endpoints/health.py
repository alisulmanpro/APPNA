from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from app.core.database import get_db

router = APIRouter(prefix="/health", tags=["Check Database Health"])

@router.get("/")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("""
            SELECT
                pg_size_pretty(pg_database_size(current_database())) AS total_size,
                pg_database_size(current_database()) AS total_bytes
        """))
        row = result.fetchone()

        return {
            "status": "connected",
            "database": "neon_postgresql",
            "total_size": row.total_size,
            "total_bytes": row.total_bytes,
        }

    except OperationalError as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "disconnected",
                "error": "Cannot reach database",
                "detail": str(e.orig),
                "hint": "Check your DATABASE_URL or Neon dashboard"
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "error": str(e),
            }
        )