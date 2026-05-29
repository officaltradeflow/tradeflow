from typing import Dict, Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_subscriptions: Dict[str, Set[str]] = {}
        self.symbol_subscribers: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_subscriptions[user_id] = set()
        logger.info("WS connected: %s  (total: %d)", user_id, len(self.active_connections))

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)
        for symbol in self.user_subscriptions.pop(user_id, set()):
            if symbol in self.symbol_subscribers:
                self.symbol_subscribers[symbol].discard(user_id)
                if not self.symbol_subscribers[symbol]:
                    del self.symbol_subscribers[symbol]
        logger.info("WS disconnected: %s  (total: %d)", user_id, len(self.active_connections))

    async def subscribe(self, user_id: str, symbols: list):
        self.user_subscriptions.setdefault(user_id, set())
        for raw in symbols:
            sym = raw.upper()
            self.user_subscriptions[user_id].add(sym)
            self.symbol_subscribers.setdefault(sym, set()).add(user_id)
        logger.debug("User %s subscribed to %s", user_id, symbols)

    async def unsubscribe(self, user_id: str, symbols: list):
        subs = self.user_subscriptions.get(user_id, set())
        for raw in symbols:
            sym = raw.upper()
            subs.discard(sym)
            if sym in self.symbol_subscribers:
                self.symbol_subscribers[sym].discard(user_id)
                if not self.symbol_subscribers[sym]:
                    del self.symbol_subscribers[sym]

    async def send_personal_message(self, message: dict, user_id: str):
        ws = self.active_connections.get(user_id)
        if ws:
            try:
                await ws.send_text(json.dumps(message))
            except Exception as exc:
                logger.warning("Send failed for %s: %s", user_id, exc)
                self.disconnect(user_id)

    async def broadcast_market_data(self, market_data: Dict[str, dict]):
        """Push live price updates to all subscribers of each symbol."""
        for symbol, data in market_data.items():
            subscribers = self.symbol_subscribers.get(symbol, set())
            if not subscribers:
                continue
            message = {"type": "market_data", "symbol": symbol, "data": data}
            for user_id in list(subscribers):
                await self.send_personal_message(message, user_id)

    async def broadcast_to_all(self, message: dict):
        """Send a message to every connected client."""
        for user_id in list(self.active_connections):
            await self.send_personal_message(message, user_id)

    async def broadcast_trade_update(self, trade_data: dict, user_id: str = None):
        message = {"type": "trade_update", "data": trade_data}
        if user_id:
            await self.send_personal_message(message, user_id)
        else:
            await self.broadcast_to_all(message)

    def get_connection_count(self) -> int:
        return len(self.active_connections)

    def get_user_subscriptions(self, user_id: str) -> Set[str]:
        return self.user_subscriptions.get(user_id, set())
