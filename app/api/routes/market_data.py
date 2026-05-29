from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import logging

from app.api.routes.auth import get_current_user
from app.database.models import User
from app.services.data_service import DataService

router = APIRouter()
logger = logging.getLogger(__name__)

_data_service = DataService()


# ── Schemas ───────────────────────────────────────────────────────────────────

class QuoteResponse(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    currency: str = "USD"
    exchange: str = ""
    timestamp: str
    data_source: str


class OHLCVPoint(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class HistoricalResponse(BaseModel):
    symbol: str
    period: str
    interval: str
    data: List[OHLCVPoint]


class NewsItem(BaseModel):
    title: str
    summary: Optional[str] = ""
    source: Optional[str] = ""
    url: Optional[str] = ""
    published_at: Optional[str] = ""
    image: Optional[str] = None


class SearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str
    type: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/quote/{symbol}", response_model=QuoteResponse)
async def get_quote(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Get real-time quote for a single symbol."""
    symbol = symbol.upper().strip()
    data = await _data_service.fetch_quote(symbol)
    if not data:
        raise HTTPException(404, f"Could not fetch quote for '{symbol}'. Check the symbol and try again.")
    return data


@router.get("/quotes", response_model=List[QuoteResponse])
async def get_quotes(
    symbols: str = Query(..., description="Comma-separated list of symbols, e.g. AAPL,TSLA,MSFT"),
    current_user: User = Depends(get_current_user)
):
    """Get real-time quotes for multiple symbols at once."""
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not sym_list:
        raise HTTPException(400, "Provide at least one symbol")
    if len(sym_list) > 20:
        raise HTTPException(400, "Maximum 20 symbols per request")

    results = await _data_service.fetch_quotes(sym_list)
    return list(results.values())


@router.get("/historical/{symbol}", response_model=HistoricalResponse)
async def get_historical(
    symbol: str,
    period: str = Query("1mo", description="1d | 5d | 1mo | 3mo | 6mo | 1y | 2y | 5y | max | ytd"),
    interval: str = Query("1d", description="1m | 5m | 15m | 60m | 1d | 1wk | 1mo"),
    current_user: User = Depends(get_current_user)
):
    """Get OHLCV historical price data for charting."""
    symbol = symbol.upper().strip()
    raw = await _data_service.get_historical_data(symbol, period, interval)
    if not raw:
        raise HTTPException(404, f"No historical data available for '{symbol}'")

    return HistoricalResponse(
        symbol=symbol,
        period=period,
        interval=interval,
        data=[OHLCVPoint(**p) for p in raw]
    )


@router.get("/news", response_model=List[NewsItem])
async def get_news(
    symbol: Optional[str] = Query(None, description="Optional stock symbol for symbol-specific news"),
    limit: int = Query(10, ge=1, le=30),
    current_user: User = Depends(get_current_user)
):
    """
    Get financial news. Pass ?symbol=AAPL for stock-specific news,
    or omit for general market news.
    Requires NEWS_API_KEY env var for NewsAPI; falls back to Yahoo Finance news.
    """
    news = await _data_service.get_news(symbol=symbol, limit=limit)
    return [NewsItem(**n) for n in news]


@router.get("/search", response_model=List[SearchResult])
async def search_symbols(
    q: str = Query(..., min_length=1, description="Search query — ticker or company name"),
    current_user: User = Depends(get_current_user)
):
    """Search for stocks, ETFs, and other instruments by name or ticker."""
    results = await _data_service.search_symbols(q.strip())
    return [SearchResult(**r) for r in results]


@router.get("/watchlist")
async def get_watchlist_quotes(
    symbols: str = Query("AAPL,TSLA,MSFT,NVDA,GOOGL,AMZN,META,JPM"),
    current_user: User = Depends(get_current_user)
):
    """Convenience endpoint — fetch all watchlist symbols in one call."""
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()][:10]
    results = await _data_service.fetch_quotes(sym_list)
    return list(results.values())
