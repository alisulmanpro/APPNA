from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.database import engine

connectable = engine  # if you import it
# or
target_metadata = Base.metadata

# In run_migrations_online():
connectable = create_async_engine(settings.DATABASE_URL, ...)