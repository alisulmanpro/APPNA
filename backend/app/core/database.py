# app/core/database.py
import os
from dotenv import load_dotenv
from sqlalchemy import make_url
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

DATABASE_URL_STR = os.getenv("DATABASE_URL")

if not DATABASE_URL_STR:
    raise ValueError("DATABASE_URL not found")

original_url = make_url(DATABASE_URL_STR)

query_dict = dict(original_url.query)

# remove unsupported params for asyncpg
query_dict.pop("sslmode", None)
query_dict.pop("channel_binding", None)

# ensure ssl works with asyncpg
query_dict["ssl"] = "require"

fixed_url = original_url.set(query=query_dict)

engine = create_async_engine(
    fixed_url,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except:
            await session.rollback()
            raise
