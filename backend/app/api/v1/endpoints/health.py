from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/")
async def health_check(db: AsyncSession = Depends(get_db)):
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