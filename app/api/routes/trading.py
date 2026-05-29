from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

from app.database.database import get_db
from app.database.models import Portfolio, Holding, Trade, User
from app.core.config import settings
from app.api.routes.auth import get_current_user
from app.services.data_service import DataService

router = APIRouter()
logger = logging.getLogger(__name__)

# Shared DataService instance (injected via dependency in production)
_data_service = DataService()


# ── Schemas ───────────────────────────────────────────────────────────────────

class TradeRequest(BaseModel):
    symbol: str
    trade_type: str          # "buy" | "sell"
    quantity: float
    order_type: str = "market"
    limit_price: Optional[float] = None

class HoldingResponse(BaseModel):
    id: int
    symbol: str
    quantity: float
    average_cost: float
    current_price: float
    total_value: float
    profit_loss: float
    profit_loss_percent: float

class TradeResponse(BaseModel):
    id: int
    symbol: str
    trade_type: str
    quantity: float
    price: float
    total_amount: float
    commission: float
    order_type: str
    timestamp: datetime

    class Config:
        from_attributes = True

class PositionSummary(BaseModel):
    portfolio_id: int
    cash_balance: float
    invested_value: float
    total_portfolio_value: float
    total_profit_loss: float
    total_profit_loss_percent: float
    number_of_positions: int


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_portfolio(portfolio_id: int, user: User, db: Session) -> Portfolio:
    p = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == user.id
    ).first()
    if not p:
        raise HTTPException(404, "Portfolio not found")
    return p

async def _get_price(symbol: str) -> float:
    quote = await _data_service.fetch_quote(symbol)
    if not quote:
        raise HTTPException(400, f"Could not fetch price for {symbol}. Check the symbol and try again.")
    return quote["price"]


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/execute")
async def execute_trade(
    req: TradeRequest,
    portfolio_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    symbol = req.symbol.upper()
    portfolio = _get_portfolio(portfolio_id, current_user, db)

    if req.quantity <= 0:
        raise HTTPException(400, "Quantity must be greater than 0")
    if req.trade_type not in ("buy", "sell"):
        raise HTTPException(400, "trade_type must be 'buy' or 'sell'")

    # Get execution price
    if req.order_type == "limit" and req.limit_price:
        price = req.limit_price
    else:
        price = await _get_price(symbol)

    quantity = round(req.quantity, 6)
    total = round(price * quantity, 6)
    commission = round(total * settings.COMMISSION_RATE, 6)

    if req.trade_type == "buy":
        total_cost = total + commission
        # Max position check (25% of total portfolio value)
        holding = db.query(Holding).filter(
            Holding.portfolio_id == portfolio_id, Holding.symbol == symbol
        ).first()
        existing_value = holding.total_value if holding else 0
        est_portfolio = portfolio.current_balance + existing_value  # rough
        if total_cost > portfolio.current_balance:
            raise HTTPException(400, f"Insufficient cash. Need {total_cost:.2f}, have {portfolio.current_balance:.2f}")

        # Update or create holding
        if holding:
            new_qty = holding.quantity + quantity
            holding.average_cost = (holding.average_cost * holding.quantity + total) / new_qty
            holding.quantity = new_qty
            holding.current_price = price
            holding.total_value = new_qty * price
            holding.last_updated = datetime.utcnow()
        else:
            holding = Holding(
                portfolio_id=portfolio_id, symbol=symbol,
                quantity=quantity, average_cost=price,
                current_price=price, total_value=total
            )
            db.add(holding)

        portfolio.current_balance = round(portfolio.current_balance - total_cost, 6)

    else:  # sell
        holding = db.query(Holding).filter(
            Holding.portfolio_id == portfolio_id, Holding.symbol == symbol
        ).first()
        if not holding or holding.quantity < quantity:
            raise HTTPException(400, f"Insufficient shares. Have {holding.quantity if holding else 0:.4f}, selling {quantity:.4f}")

        holding.quantity = round(holding.quantity - quantity, 6)
        holding.current_price = price
        holding.total_value = holding.quantity * price
        holding.last_updated = datetime.utcnow()

        if holding.quantity < 0.0001:
            db.delete(holding)

        proceeds = total - commission
        portfolio.current_balance = round(portfolio.current_balance + proceeds, 6)

    # Record trade
    trade = Trade(
        user_id=current_user.id,
        portfolio_id=portfolio_id,
        symbol=symbol,
        trade_type=req.trade_type,
        quantity=quantity,
        price=price,
        total_amount=total,
        commission=commission,
        order_type=req.order_type,
    )
    db.add(trade)
    db.commit()
    logger.info("%s %s %.4f x %s @ %.2f", current_user.username, req.trade_type, quantity, symbol, price)
    return {"message": "Trade executed", "symbol": symbol, "quantity": quantity, "price": price, "total": total}


@router.get("/holdings/{portfolio_id}", response_model=List[HoldingResponse])
async def get_holdings(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _get_portfolio(portfolio_id, current_user, db)
    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio_id).all()

    result = []
    for h in holdings:
        try:
            quote = await _data_service.fetch_quote(h.symbol)
            current_price = quote["price"] if quote else h.current_price
        except Exception:
            current_price = h.current_price

        h.current_price = current_price
        h.total_value = round(h.quantity * current_price, 2)
        db.commit()

        cost_basis = h.average_cost * h.quantity
        pl = h.total_value - cost_basis
        pl_pct = (pl / cost_basis * 100) if cost_basis else 0

        result.append(HoldingResponse(
            id=h.id, symbol=h.symbol, quantity=h.quantity,
            average_cost=h.average_cost, current_price=current_price,
            total_value=h.total_value, profit_loss=round(pl, 2),
            profit_loss_percent=round(pl_pct, 2)
        ))

    return result


@router.get("/positions/{portfolio_id}", response_model=PositionSummary)
async def get_positions(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = _get_portfolio(portfolio_id, current_user, db)
    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio_id).all()

    invested = 0.0
    for h in holdings:
        try:
            quote = await _data_service.fetch_quote(h.symbol)
            price = quote["price"] if quote else h.current_price
        except Exception:
            price = h.current_price
        h.current_price = price
        h.total_value = round(h.quantity * price, 2)
        invested += h.total_value

    db.commit()

    total = round(portfolio.current_balance + invested, 2)
    initial = portfolio.initial_balance
    pl = round(total - initial, 2)
    pl_pct = round((pl / initial * 100) if initial else 0, 2)

    return PositionSummary(
        portfolio_id=portfolio_id,
        cash_balance=round(portfolio.current_balance, 2),
        invested_value=round(invested, 2),
        total_portfolio_value=total,
        total_profit_loss=pl,
        total_profit_loss_percent=pl_pct,
        number_of_positions=len(holdings)
    )


@router.get("/history/{portfolio_id}", response_model=List[TradeResponse])
def get_trade_history(
    portfolio_id: int,
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _get_portfolio(portfolio_id, current_user, db)
    trades = (
        db.query(Trade)
        .filter(Trade.portfolio_id == portfolio_id)
        .order_by(Trade.timestamp.desc())
        .limit(limit)
        .all()
    )
    return trades
