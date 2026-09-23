import os
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
load_dotenv()

class Settings:
    SERPAPI_API_KEY: str | None = os.getenv("SERPAPI_API_KEY")
    
settings = Settings()
