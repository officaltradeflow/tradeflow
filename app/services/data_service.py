import asyncio
import aiohttp
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

from app.core.config import settings
from app.websocket.connection_manager import ConnectionManager

logger = logging.getLogger(__name__)

# ── Yahoo Finance headers (mimics browser) ───────────────────────────────────
_YF_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
}

# Maps frontend period labels → (Yahoo range, Yahoo interval)
_RANGE_MAP: Dict[str, tuple] = {
    "1d":  ("1d",  "5m"),
    "5d":  ("5d",  "60m"),
    "1mo": ("1mo", "1d"),
    "3mo": ("3mo", "1d"),
    "6mo": ("6mo", "1wk"),
    "1y":  ("1y",  "1wk"),
    "2y":  ("2y",  "1mo"),
    "5y":  ("5y",  "1mo"),
    "max": ("max", "3mo"),
    "ytd": ("ytd", "1d"),
}


class DataService:
    def __init__(self):
        self._cache: Dict[str, dict] = {}          # key → {data, ts}
        self.subscribed_symbols: set = set()

    # ── Background real-time broadcast loop ───────────────────────────────────

    async def start_real_time_data(self, connection_manager: ConnectionManager):
        """Periodically fetch subscribed symbols and push to WebSocket clients."""
        while True:
            try:
                if self.subscribed_symbols:
                    data = await self.fetch_quotes(list(self.subscribed_symbols))
                    for symbol, quote in data.items():
                        self._set_cache(f"quote:{symbol}", quote)
                    await connection_manager.broadcast_market_data(data)
                await asyncio.sleep(settings.DATA_UPDATE_INTERVAL)
            except Exception as exc:
                logger.error("Real-time data loop error: %s", exc)
                await asyncio.sleep(15)

    # ── Quote fetching ─────────────────────────────────────────────────────────

    async def fetch_quote(self, symbol: str) -> Optional[Dict]:
        """Get a single quote, using cache if fresh."""
        key = f"quote:{symbol.upper()}"
        cached = self._get_cache(key)
        if cached:
            return cached

        result = await self._yahoo_quote(symbol.upper())
        if result:
            self._set_cache(key, result)
        return result

    async def fetch_quotes(self, symbols: List[str]) -> Dict[str, Dict]:
        """Fetch quotes for multiple symbols concurrently."""
        tasks = {sym.upper(): self.fetch_quote(sym) for sym in symbols}
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)
        out = {}
        for sym, res in zip(tasks.keys(), results):
            if isinstance(res, dict) and res:
                out[sym] = res
        return out

    async def _yahoo_quote(self, symbol: str) -> Optional[Dict]:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        params = {"range": "5d", "interval": "1h", "includePrePost": "false"}
        try:
            async with aiohttp.ClientSession(headers=_YF_HEADERS) as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                    if resp.status != 200:
                        return None
                    data = await resp.json()

            result = data.get("chart", {}).get("result")
            if not result:
                return None

            meta = result[0].get("meta", {})
            price = meta.get("regularMarketPrice") or meta.get("previousClose")
            if not price:
                return None

            prev = meta.get("chartPreviousClose") or meta.get("previousClose") or price
            change = price - prev
            change_pct = (change / prev * 100) if prev else 0.0

            return {
                "symbol": symbol,
                "name": meta.get("shortName") or meta.get("longName") or symbol,
                "price": float(price),
                "change": float(change),
                "change_percent": float(change_pct),
                "volume": int(meta.get("regularMarketVolume") or 0),
                "market_cap": meta.get("marketCap"),
                "currency": meta.get("currency", "USD"),
                "exchange": meta.get("exchangeName", ""),
                "timestamp": datetime.utcnow().isoformat(),
                "data_source": "yahoo",
            }
        except Exception as exc:
            logger.warning("Yahoo quote error %s: %s", symbol, exc)
            return None

    # ── Historical data ────────────────────────────────────────────────────────

    async def get_historical_data(self, symbol: str, period: str = "1mo", interval: str = "1d") -> List[Dict]:
        api_range, api_interval = _RANGE_MAP.get(period, (period, interval))
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol.upper()}"
        params = {"range": api_range, "interval": api_interval, "includePrePost": "false"}
        try:
            async with aiohttp.ClientSession(headers=_YF_HEADERS) as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status != 200:
                        return []
                    data = await resp.json()

            result = data.get("chart", {}).get("result")
            if not result:
                return []

            timestamps = result[0].get("timestamp", [])
            ohlcv = result[0].get("indicators", {}).get("quote", [{}])[0]
            closes = ohlcv.get("close", [])
            opens = ohlcv.get("open", [])
            highs = ohlcv.get("high", [])
            lows = ohlcv.get("low", [])
            volumes = ohlcv.get("volume", [])

            out = []
            for i, ts in enumerate(timestamps):
                close = closes[i] if i < len(closes) and closes[i] is not None else None
                if close is None:
                    continue
                out.append({
                    "timestamp": datetime.utcfromtimestamp(ts).isoformat(),
                    "open":   float(opens[i])   if i < len(opens)   and opens[i]   else close,
                    "high":   float(highs[i])   if i < len(highs)   and highs[i]   else close,
                    "low":    float(lows[i])    if i < len(lows)    and lows[i]    else close,
                    "close":  float(close),
                    "volume": int(volumes[i])   if i < len(volumes) and volumes[i] else 0,
                })
            return out
        except Exception as exc:
            logger.error("Historical data error %s: %s", symbol, exc)
            return []

    # ── News feed ─────────────────────────────────────────────────────────────

    async def get_news(self, symbol: Optional[str] = None, limit: int = 10) -> List[Dict]:
        """
        Fetch financial news.
        Uses NewsAPI if key is configured, otherwise falls back to Yahoo Finance news.
        """
        if settings.NEWS_API_KEY:
            return await self._newsapi_news(symbol, limit)
        return await self._yahoo_news(symbol, limit)

    async def _newsapi_news(self, symbol: Optional[str], limit: int) -> List[Dict]:
        query = symbol if symbol else "stock market"
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": query,
            "sortBy": "publishedAt",
            "language": "en",
            "pageSize": limit,
            "apiKey": settings.NEWS_API_KEY,
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                    if resp.status != 200:
                        return []
                    data = await resp.json()
            return [
                {
                    "title": a.get("title", ""),
                    "summary": a.get("description", ""),
                    "source": a.get("source", {}).get("name", ""),
                    "url": a.get("url", ""),
                    "published_at": a.get("publishedAt", ""),
                    "image": a.get("urlToImage"),
                }
                for a in data.get("articles", [])[:limit]
                if a.get("title")
            ]
        except Exception as exc:
            logger.warning("NewsAPI error: %s", exc)
            return []

    async def _yahoo_news(self, symbol: Optional[str], limit: int) -> List[Dict]:
        query = symbol if symbol else "stock+market"
        url = "https://query1.finance.yahoo.com/v1/finance/search"
        params = {"q": query, "quotesCount": 0, "newsCount": limit, "lang": "en-US"}
        try:
            async with aiohttp.ClientSession(headers=_YF_HEADERS) as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                    if resp.status != 200:
                        return []
                    data = await resp.json()
            news = data.get("news", [])
            return [
                {
                    "title": n.get("title", ""),
                    "summary": n.get("summary", ""),
                    "source": n.get("publisher", ""),
                    "url": n.get("link", ""),
                    "published_at": datetime.utcfromtimestamp(n["providerPublishTime"]).isoformat()
                    if n.get("providerPublishTime") else "",
                    "image": n.get("thumbnail", {}).get("resolutions", [{}])[0].get("url") if n.get("thumbnail") else None,
                }
                for n in news[:limit]
                if n.get("title")
            ]
        except Exception as exc:
            logger.warning("Yahoo news error: %s", exc)
            return []

    # ── Symbol search ──────────────────────────────────────────────────────────

    async def search_symbols(self, query: str) -> List[Dict]:
        url = "https://query2.finance.yahoo.com/v1/finance/search"
        params = {"q": query, "quotesCount": 10, "newsCount": 0}
        try:
            async with aiohttp.ClientSession(headers=_YF_HEADERS) as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=6)) as resp:
                    if resp.status != 200:
                        return []
                    data = await resp.json()
            return [
                {
                    "symbol": q["symbol"],
                    "name": q.get("longname") or q.get("shortname", ""),
                    "exchange": q.get("fullExchangeName", ""),
                    "type": q.get("quoteType", "EQUITY"),
                }
                for q in data.get("quotes", [])
                if q.get("quoteType") in {"EQUITY", "ETF", "MUTUALFUND", "CRYPTOCURRENCY"}
            ][:10]
        except Exception as exc:
            logger.warning("Symbol search error: %s", exc)
            return []

    # ── Subscription helpers ───────────────────────────────────────────────────

    def subscribe_symbol(self, symbol: str):
        self.subscribed_symbols.add(symbol.upper())

    def unsubscribe_symbol(self, symbol: str):
        self.subscribed_symbols.discard(symbol.upper())

    # ── In-memory cache ────────────────────────────────────────────────────────

    def _set_cache(self, key: str, value: dict):
        self._cache[key] = {"data": value, "ts": datetime.utcnow()}

    def _get_cache(self, key: str) -> Optional[dict]:
        entry = self._cache.get(key)
        if not entry:
            return None
        age = (datetime.utcnow() - entry["ts"]).total_seconds()
        if age > settings.CACHE_TTL_SECONDS:
            del self._cache[key]
            return None
        return entry["data"]
