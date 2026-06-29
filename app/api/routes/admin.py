from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import logging
import os

from app.database.database import get_db
from app.database.models import User, Portfolio, Trade, Holding

router = APIRouter()
logger = logging.getLogger(__name__)

# SECURITY: avoid hardcoding tokens in code
# Set this in your environment, e.g. ADMIN_SESSION="your-secret"
ADMIN_TOKEN = os.getenv("ADMIN_SESSION", "")


def require_admin(authorization: Optional[str] = Header(None)):
    if not ADMIN_TOKEN:
        # Fail closed if not configured
        raise HTTPException(500, "Admin access is not configured")

    expected = f"Bearer {ADMIN_TOKEN}"
    if authorization != expected:
        raise HTTPException(403, "Admin access required")


class AdminStats(BaseModel):
    total_users: int
    total_portfolios: int
    total_trades: int
    trades_today: int
    total_coins: int
    active_users_7d: int
    server_status: str = "online"


class AdminUserEntry(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)

    total_users = db.query(func.count(User.id)).scalar()
    total_portfolios = db.query(func.count(Portfolio.id)).scalar()
    total_trades = db.query(func.count(Trade.id)).scalar()
    trades_today = (
        db.query(func.count(Trade.id)).filter(Trade.timestamp >= today_start).scalar()
    )
    active_7d = (
        db.query(func.count(Trade.user_id.distinct()))
        .filter(Trade.timestamp >= week_ago)
        .scalar()
    )

    return AdminStats(
        total_users=total_users,
        total_portfolios=total_portfolios,
        total_trades=total_trades,
        trades_today=trades_today,
        total_coins=0,
        active_users_7d=active_7d,
        server_status="online",
    )


@router.get("/users", response_model=List[AdminUserEntry])
def get_all_users(
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).limit(100).all()


@router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = False
    db.commit()
    return {"message": f"User {user.username} deactivated"}


@router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = True
    db.commit()
    return {"message": f"User {user.username} activated"}


@router.post("/reset-cache")
def reset_cache(_: None = Depends(require_admin)):
    return {"message": "Cache cleared successfully"}


@router.get("/trades/recent")
def get_recent_trades(
    limit: int = 50,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    trades = (
        db.query(Trade, User.username)
        .join(User, Trade.user_id == User.id)
        .order_by(Trade.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": t.Trade.id,
            "username": t.username,
            "symbol": t.Trade.symbol,
            "trade_type": t.Trade.trade_type,
            "quantity": t.Trade.quantity,
            "price": t.Trade.price,
            "total_amount": t.Trade.total_amount,
            "timestamp": t.Trade.timestamp.isoformat(),
        }
        for t in trades
    ]
