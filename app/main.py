import os
import asyncio
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.api.routes import auth, trading, portfolio, competitions, market_data, admin
from app.websocket.connection_manager import ConnectionManager
from app.services.data_service import DataService
from app.services.ai_trader import AITrader

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s"
)
logger = logging.getLogger(__name__)

# Create all DB tables on startup
from app.database import models
from app.database.database import engine
models.Base.metadata.create_all(bind=engine)

# Singletons
connection_manager = ConnectionManager()
data_service = DataService()


async def run_ai_trader():
    """Run the AI trader bot as a background task."""
    try:
        trader = AITrader()
        await trader.run()
    except Exception as e:
        logger.error("AI trader crashed: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    logger.info("TradeFlow starting up…")
    asyncio.create_task(data_service.start_real_time_data(connection_manager))
    asyncio.create_task(run_ai_trader())
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("TradeFlow shutting down.")


app = FastAPI(
    title="TradeFlow API",
    description="Stock trading simulator — real market data, virtual money",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router,         prefix="/api/auth",         tags=["auth"])
app.include_router(trading.router,      prefix="/api/trading",      tags=["trading"])
app.include_router(portfolio.router,    prefix="/api/portfolio",    tags=["portfolio"])
app.include_router(competitions.router, prefix="/api/competitions", tags=["competitions"])
app.include_router(market_data.router,  prefix="/api/market",       tags=["market"])
app.include_router(admin.router,        prefix="/api/admin",        tags=["admin"])


# ── WebSocket ─────────────────────────────────────────────────────────────────
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await connection_manager.connect(websocket, user_id)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("type")
            if msg_type == "subscribe":
                await connection_manager.subscribe(user_id, msg.get("symbols", []))
                for sym in msg.get("symbols", []):
                    data_service.subscribe_symbol(sym)
            elif msg_type == "unsubscribe":
                await connection_manager.unsubscribe(user_id, msg.get("symbols", []))
            elif msg_type == "ping":
                await connection_manager.send_personal_message({"type": "pong"}, user_id)

    except WebSocketDisconnect:
        connection_manager.disconnect(user_id)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "database": "connected",
        "ws_connections": connection_manager.get_connection_count(),
    }


# ── Serve static frontend ─────────────────────────────────────────────────────
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
_static_dir = os.path.abspath(_static_dir)

if os.path.isdir(_static_dir):
    app.mount("/static", StaticFiles(directory=_static_dir), name="static")
    logger.info("Serving static files from %s", _static_dir)

@app.get("/")
async def root():
    index = os.path.join(_static_dir, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return {"message": "TradeFlow API v2.0.0", "docs": "/api/docs"}

@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("static/") or full_path == "ws":
        from fastapi import HTTPException
        raise HTTPException(404)
    index = os.path.join(_static_dir, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return {"message": "TradeFlow API v2.0.0"}
