from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:////home/Stocksimulater/trading_simulator.db"

    # API Keys
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    FMP_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None

    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Trading Settings
    PRACTICE_PORTFOLIO_AMOUNT: float = 100_000.00
    COMPETITIVE_PORTFOLIO_AMOUNT: float = 50_000.00
    MAX_TRADE_SIZE_PERCENT: float = 0.25  # 25% of portfolio max per trade
    COMMISSION_RATE: float = 0.001  # 0.1%

    # Real-time Data
    DATA_UPDATE_INTERVAL: int = 10  # seconds between WebSocket price pushes
    CACHE_TTL_SECONDS: int = 300    # 5 minute quote cache
    MAX_WEBSOCKET_CONNECTIONS: int = 500

    class Config:
        env_file = ".env"


settings = Settings()
