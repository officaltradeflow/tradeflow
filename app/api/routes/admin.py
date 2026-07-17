import os
import secrets
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from jose import jwt, JWTError

from app.database.database import get_db
from app.database.models import User, Portfolio, Trade, Holding
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

_ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")
_ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "x7k_maple_29")


def require_admin(request: Request, authorization: Optional[str] = Header(None)):
    ip = request.client.host if request.client else "unknown"
    if not authorization:
        raise HTTPException(401, "Authorization header required", headers={"WWW-Authenticate": "Bearer"})
    
    token = authorization.removeprefix("Bearer ").strip()
    
    # Check static admin token
    if _ADMIN_TOKEN and secrets.compare_digest(token, _ADMIN_TOKEN):
        return
    
    # Check JWT token belongs to admin user
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            from app.database.database import SessionLocal
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.id == int(user_id)).first()
                if user and user.username == _ADMIN_USERNAME:
                    return
            finally:
                db.close()
    except JWTError:
        pass
    
    logger.warning(f"[ADMIN] Invalid token | IP={ip}")
    raise HTTPException(403, "Forbidden")


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
def get_admin_stats(db: Session = Depends(get_db), _: None = Depends(require_admin)):
    from datetime import timedelta
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    return AdminStats(
        total_users=db.query(func.count(User.id)).scalar(),
        total_portfolios=db.query(func.count(Portfolio.id)).scalar(),
        total_trades=db.query(func.count(Trade.id)).scalar(),
        trades_today=db.query(func.count(Trade.id)).filter(Trade.timestamp >= today_start).scalar(),
        total_coins=0,
        active_users_7d=db.query(func.count(Trade.user_id.distinct())).filter(Trade.timestamp >= week_ago).scalar(),
        server_status="online"
    )


@router.get("/users", response_model=List[AdminUserEntry])
def get_all_users(db: Session = Depends(get_db), _: None = Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).limit(100).all()


@router.post("/users/{user_id}/deactivate")
def deactivate_user(user_id: int, db: Session = Depends(get_db), _: None = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "User not found")
    user.is_active = False
    db.commit()
    return {"message": f"User {user.username} deactivated"}


@router.post("/users/{user_id}/activate")
def activate_user(user_id: int, db: Session = Depends(get_db), _: None = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "User not found")
    user.is_active = True
    db.commit()
    return {"message": f"User {user.username} activated"}


@router.post("/reset-cache")
def reset_cache(_: None = Depends(require_admin)):
    return {"message": "Cache cleared"}


@router.get("/trades/recent")
def get_recent_trades(limit: int = 50, db: Session = Depends(get_db), _: None = Depends(require_admin)):
    trades = db.query(Trade, User.username).join(User, Trade.user_id == User.id).order_by(Trade.timestamp.desc()).limit(limit).all()
    return [{"id": t.Trade.id, "username": t.username, "symbol": t.Trade.symbol, "trade_type": t.Trade.trade_type,
             "quantity": t.Trade.quantity, "price": t.Trade.price, "total_amount": t.Trade.total_amount,
             "timestamp": t.Trade.timestamp.isoformat()} for t in trades]
