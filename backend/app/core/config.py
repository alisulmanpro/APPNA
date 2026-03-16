import sys
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import ValidationError

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str

try:
    settings = Settings()
except ValidationError as e:
    print("\n __CONFIG ERROR__ — Missing required environment variables:\n")
    for err in e.errors():
        field = err["loc"][0]
        print(f"   ✗ '{field}' is missing from your .env file")
    print("\n > Make sure your .env file exists and contains:\n")
    print("   DATABASE_URL=\"postgresql+asyncpg://...\"")
    print()
    sys.exit(1)