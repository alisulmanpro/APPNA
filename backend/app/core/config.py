import sys

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import ValidationError

load_dotenv()
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str
    database_url_sync: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    refresh_token_expire_days: int = 7
    accept_url: str = "http://localhost:3000"
    resend_api_key: str
    from_email: str = "APPNA <onboarding@resend.dev>"


try:
    settings = Settings()
    print("✅ Config loaded successfully")
except ValidationError as e:
    print("\n❌ CONFIG ERROR — Missing required environment variables:\n")
    for err in e.errors():
        field = err["loc"][0]
        print(f"   ✗ '{field}' is missing from your .env file")
    sys.exit(1)