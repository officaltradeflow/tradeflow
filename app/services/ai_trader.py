"""
TradeFlow AI Trader
-------------------
Runs as a background service that:
1. Registers itself as a user if not already registered
2. Trades stocks continuously using multiple strategies
3. Keeps the Render free tier awake by making regular API calls
"""

import asyncio
import aiohttp
import random
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(message)s")
logger = logging.getLogger("ai_trader")

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URL = "https://tradeflow-hjqr.onrender.com"

AI_USERNAME = "tf_market_bot"
AI_EMAIL    = "bot@tradeflow.internal"
AI_PASSWORD = "B0t$ecure!TradeFlow99"
AI_NAME     = "TF Market Bot"

# Stocks to trade across different sectors
WATCHLIST = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",   # Tech
    "JPM",  "BAC",  "GS",                        # Finance
    "XOM",  "CVX",                               # Energy
    "JNJ",  "PFE",                               # Healthcare
    "SPY",  "QQQ",                               # ETFs
    "TSLA", "META",                              # Growth
]

TRADE_INTERVAL_MIN = 60    # seconds between trades
TRADE_INTERVAL_MAX = 180   # seconds between trades
PING_INTERVAL      = 45    # seconds between keep-alive pings

# ── Strategy weights ──────────────────────────────────────────────────────────
# momentum: buy rising, sell falling
# mean_reversion: buy falling, sell rising  
# random: unpredictable noise trader
STRATEGIES = ["momentum", "mean_reversion", "random"]
STRATEGY_WEIGHTS = [0.5, 0.3, 0.2]


class AITrader:
    def __init__(self):
        self.token = None
        self.portfolio_id = None
        self.session = None
        self.price_history: dict[str, list[float]] = {}

    # ── Auth ──────────────────────────────────────────────────────────────────

    async def register(self):
        try:
            async with self.session.post(f"{BASE_URL}/api/auth/register", json={
                "username": AI_USERNAME, "email": AI_EMAIL,
                "password": AI_PASSWORD, "full_name": AI_NAME
            }) as resp:
                if resp.status in (200, 201):
                    logger.info("AI trader registered successfully")
                else:
                    logger.info("AI trader already registered (or registration failed) — trying login")
        except Exception as e:
            logger.warning("Register error: %s", e)

    async def login(self) -> bool:
        try:
            async with self.session.post(f"{BASE_URL}/api/auth/login", json={
                "username": AI_USERNAME, "password": AI_PASSWORD
            }) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    self.token = data["access_token"]
                    logger.info("AI trader logged in")
                    return True
                else:
                    logger.error("Login failed: %s", await resp.text())
                    return False
        except Exception as e:
            logger.error("Login error: %s", e)
            return False

    def headers(self):
        return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}

    # ── Portfolio ─────────────────────────────────────────────────────────────

    async def ensure_portfolio(self):
        try:
            async with self.session.get(f"{BASE_URL}/api/portfolio/", headers=self.headers()) as resp:
                portfolios = await resp.json()
                if portfolios:
                    self.portfolio_id = portfolios[0]["id"]
                    logger.info("Using portfolio ID %s", self.portfolio_id)
                    return

            async with self.session.post(f"{BASE_URL}/api/portfolio/", headers=self.headers(), json={
                "name": "AI Trading Portfolio", "portfolio_type": "practice"
            }) as resp:
                data = await resp.json()
                self.portfolio_id = data["id"]
                logger.info("Created portfolio ID %s", self.portfolio_id)
        except Exception as e:
            logger.error("Portfolio error: %s", e)

    # ── Market data ───────────────────────────────────────────────────────────

    async def get_quote(self, symbol: str) -> dict | None:
        try:
            async with self.session.get(
                f"{BASE_URL}/api/market/quote/{symbol}", headers=self.headers()
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception as e:
            logger.warning("Quote error %s: %s", symbol, e)
        return None

    async def get_holdings(self) -> list:
        try:
            async with self.session.get(
                f"{BASE_URL}/api/trading/holdings/{self.portfolio_id}", headers=self.headers()
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception:
            pass
        return []

    async def get_positions(self) -> dict | None:
        try:
            async with self.session.get(
                f"{BASE_URL}/api/trading/positions/{self.portfolio_id}", headers=self.headers()
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception:
            pass
        return None

    # ── Trading ───────────────────────────────────────────────────────────────

    async def place_trade(self, symbol: str, trade_type: str, quantity: float):
        try:
            async with self.session.post(
                f"{BASE_URL}/api/trading/execute?portfolio_id={self.portfolio_id}",
                headers=self.headers(),
                json={"symbol": symbol, "trade_type": trade_type, "quantity": quantity, "order_type": "market"}
            ) as resp:
                if resp.status == 200:
                    logger.info("✅ %s %s %.4f shares of %s", trade_type.upper(), "", quantity, symbol)
                    return True
                else:
                    err = await resp.json()
                    logger.warning("Trade failed %s %s: %s", trade_type, symbol, err.get("detail",""))
        except Exception as e:
            logger.warning("Trade error: %s", e)
        return False

    # ── Strategy ──────────────────────────────────────────────────────────────

    def pick_strategy(self) -> str:
        return random.choices(STRATEGIES, weights=STRATEGY_WEIGHTS)[0]

    def update_price_history(self, symbol: str, price: float):
        if symbol not in self.price_history:
            self.price_history[symbol] = []
        self.price_history[symbol].append(price)
        if len(self.price_history[symbol]) > 10:
            self.price_history[symbol].pop(0)

    def momentum_signal(self, symbol: str, change_pct: float) -> str | None:
        """Buy if rising strongly, sell if falling strongly."""
        if change_pct > 1.0:
            return "buy"
        elif change_pct < -1.0:
            return "sell"
        return None

    def mean_reversion_signal(self, symbol: str, change_pct: float) -> str | None:
        """Buy if oversold, sell if overbought."""
        if change_pct < -2.0:
            return "buy"   # bounce expected
        elif change_pct > 2.0:
            return "sell"  # pullback expected
        return None

    def random_signal(self) -> str:
        return random.choice(["buy", "sell", "hold", "hold"])

    async def decide_and_trade(self):
        symbol = random.choice(WATCHLIST)
        quote = await self.get_quote(symbol)
        if not quote:
            return

        price = quote["price"]
        change_pct = quote.get("change_percent", 0)
        self.update_price_history(symbol, price)

        strategy = self.pick_strategy()
        signal = None

        if strategy == "momentum":
            signal = self.momentum_signal(symbol, change_pct)
        elif strategy == "mean_reversion":
            signal = self.mean_reversion_signal(symbol, change_pct)
        elif strategy == "random":
            signal = self.random_signal()

        if not signal or signal == "hold":
            logger.info("📊 %s @ $%.2f — holding (%s strategy)", symbol, price, strategy)
            return

        positions = await self.get_positions()
        if not positions:
            return

        cash = positions["cash_balance"]
        holdings = await self.get_holdings()
        holding = next((h for h in holdings if h["symbol"] == symbol), None)

        if signal == "buy":
            # Spend 3-8% of cash on each trade
            spend_pct = random.uniform(0.03, 0.08)
            spend = min(cash * spend_pct, cash * 0.20)  # max 20% of cash
            if spend < 10 or price <= 0:
                logger.info("💸 Not enough cash to buy %s", symbol)
                return
            quantity = round(spend / price, 4)
            if quantity > 0:
                await self.place_trade(symbol, "buy", quantity)

        elif signal == "sell" and holding:
            # Sell 25-75% of holding
            sell_pct = random.uniform(0.25, 0.75)
            quantity = round(holding["quantity"] * sell_pct, 4)
            if quantity > 0.0001:
                await self.place_trade(symbol, "sell", quantity)
            else:
                logger.info("📉 Nothing to sell for %s", symbol)

    # ── Keep-alive ping ───────────────────────────────────────────────────────

    async def ping(self):
        try:
            async with self.session.get(f"{BASE_URL}/health") as resp:
                if resp.status == 200:
                    logger.debug("🏓 Ping OK")
        except Exception:
            pass

    # ── Main loop ─────────────────────────────────────────────────────────────

    async def run(self):
        async with aiohttp.ClientSession() as session:
            self.session = session

            # Boot sequence
            await self.register()
            if not await self.login():
                logger.error("Could not log in — exiting")
                return
            await self.ensure_portfolio()

            logger.info("🤖 AI Trader running — trading %d symbols", len(WATCHLIST))

            ping_task = asyncio.create_task(self._ping_loop())
            trade_task = asyncio.create_task(self._trade_loop())

            await asyncio.gather(ping_task, trade_task)

    async def _ping_loop(self):
        while True:
            await self.ping()
            await asyncio.sleep(PING_INTERVAL)

    async def _trade_loop(self):
        while True:
            try:
                await self.decide_and_trade()
            except Exception as e:
                logger.error("Trade loop error: %s", e)
            wait = random.randint(TRADE_INTERVAL_MIN, TRADE_INTERVAL_MAX)
            logger.info("⏳ Next trade in %ds", wait)
            await asyncio.sleep(wait)


if __name__ == "__main__":
    trader = AITrader()
    asyncio.run(trader.run())
