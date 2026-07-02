from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./tradeflow.db"
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    FMP_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    PRACTICE_PORTFOLIO_AMOUNT: float = 100_000.00
    COMPETITIVE_PORTFOLIO_AMOUNT: float = 50_000.00
    MAX_TRADE_SIZE_PERCENT: float = 0.25
    COMMISSION_RATE: float = 0.001
    DATA_UPDATE_INTERVAL: int = 10
    CACHE_TTL_SECONDS: int = 300
    MAX_WEBSOCKET_CONNECTIONS: int = 500

    class Config:
        env_file = ".env"

settings = Settings()
