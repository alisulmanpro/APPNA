from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine, get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: nothing special usually needed for Neon + asyncpg
    yield
    # Shutdown: cleanly dispose the engine (important for async engines)
    await engine.dispose()


app = FastAPI(
    title="APPNA Backend",
    description="Backend API for APPNA project",
    version="0.1.0",
    lifespan=lifespan,
    # Optional: you can add these later
    # docs_url="/docs",
    # redoc_url="/redoc",
    # openapi_url="/openapi.json",
)


@app.get("/test-db", tags=["Health"])
async def test_db(db: AsyncSession = Depends(get_db)):
    """
    Simple endpoint to verify database connection.
    Returns success if Neon DB is reachable.
    """
    try:
        # Execute a trivial query to test the connection
        result = await db.execute(text("SELECT 1"))
        value = result.scalar()
        if value == 1:
            return {"status": "success", "message": "Database connected! Neon PostgreSQL is reachable."}
        else:
            return {"status": "warning", "message": "Query ran but unexpected result"}
    except Exception as e:
        return {
            "status": "error",
            "message": "Database connection failed",
            "detail": str(e)
        }


# You can add more root-level endpoints here, for example:
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to APPNA Backend API",
        "docs": "/docs",
        "test_db": "/test-db"
    }