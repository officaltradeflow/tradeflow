from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from app.database.database import get_db
from app.api.routes.auth import get_current_user
from app.database.models import User

router = APIRouter()

def get_market(db):
    result = db.execute(text("SELECT price, supply FROM flow_market ORDER BY id DESC LIMIT 1")).fetchone()
    if not result:
        db.execute(text("INSERT INTO flow_market (price, supply) VALUES (100.0, 1000000.0)"))
        db.commit()
        return {"price": 100.0, "supply": 1000000.0}
    return {"price": float(result[0]), "supply": float(result[1])}

def get_user_coins(db, user_id):
    result = db.execute(text("SELECT balance FROM user_coins WHERE user_id = :uid"), {"uid": user_id}).fetchone()
    if not result:
        db.execute(text("INSERT INTO user_coins (user_id, balance) VALUES (:uid, 0) ON CONFLICT (user_id) DO NOTHING"), {"uid": user_id})
        db.commit()
        return 0.0
    return float(result[0])

def get_user_holdings(db, user_id):
    result = db.execute(text("SELECT shares FROM flow_holdings WHERE user_id = :uid"), {"uid": user_id}).fetchone()
    if not result:
        return 0.0
    return float(result[0])

@router.get("/price")
def get_price(db: Session = Depends(get_db)):
    market = get_market(db)
    history = db.execute(text(
        "SELECT price, timestamp FROM flow_trades ORDER BY timestamp DESC LIMIT 50"
    )).fetchall()
    return {
        "price": market["price"],
        "supply": market["supply"],
        "history": [{"price": float(r[0]), "t": r[1].isoformat()} for r in reversed(history)]
    }

@router.get("/position")
def get_position(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    market = get_market(db)
    coins = get_user_coins(db, current_user.id)
    shares = get_user_holdings(db, current_user.id)
    return {
        "tc_balance": coins,
        "shares": shares,
        "flow_value": shares * market["price"],
        "flow_price": market["price"]
    }

class TradeRequest(BaseModel):
    amount: float

@router.post("/buy")
def buy_flow(req: TradeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if req.amount <= 0:
        raise HTTPException(400, "Amount must be positive")
    coins = get_user_coins(db, current_user.id)
    if req.amount > coins:
        raise HTTPException(400, "Insufficient TC balance")
    market = get_market(db)
    price = market["price"]
    supply = market["supply"]
    shares = req.amount / price
    new_price = round(price * (1 + (req.amount / supply) * 0.1), 8)
    new_supply = supply + req.amount
    db.execute(text("UPDATE flow_market SET price = :p, supply = :s, updated_at = NOW() WHERE id = (SELECT id FROM flow_market ORDER BY id DESC LIMIT 1)"), {"p": new_price, "s": new_supply})
    db.execute(text("UPDATE user_coins SET balance = balance - :amt, updated_at = NOW() WHERE user_id = :uid"), {"amt": req.amount, "uid": current_user.id})
    db.execute(text("INSERT INTO flow_holdings (user_id, shares) VALUES (:uid, :sh) ON CONFLICT (user_id) DO UPDATE SET shares = flow_holdings.shares + :sh, updated_at = NOW()"), {"uid": current_user.id, "sh": shares})
    db.execute(text("INSERT INTO flow_trades (user_id, trade_type, shares, tc_amount, price) VALUES (:uid, 'buy', :sh, :amt, :p)"), {"uid": current_user.id, "sh": shares, "amt": req.amount, "p": price})
    db.commit()
    return {"shares_bought": shares, "tc_spent": req.amount, "new_price": new_price, "new_tc_balance": coins - req.amount}

@router.post("/sell")
def sell_flow(req: TradeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if req.amount <= 0:
        raise HTTPException(400, "Amount must be positive")
    shares = get_user_holdings(db, current_user.id)
    if req.amount > shares:
        raise HTTPException(400, "Insufficient FLOW holdings")
    market = get_market(db)
    price = market["price"]
    supply = market["supply"]
    tc_received = req.amount * price
    new_price = max(1.0, round(price * (1 - (tc_received / supply) * 0.1), 8))
    new_supply = supply - tc_received
    db.execute(text("UPDATE flow_market SET price = :p, supply = :s, updated_at = NOW() WHERE id = (SELECT id FROM flow_market ORDER BY id DESC LIMIT 1)"), {"p": new_price, "s": new_supply})
    db.execute(text("UPDATE user_coins SET balance = balance + :amt, updated_at = NOW() WHERE user_id = :uid"), {"amt": tc_received, "uid": current_user.id})
    db.execute(text("UPDATE flow_holdings SET shares = shares - :sh, updated_at = NOW() WHERE user_id = :uid"), {"sh": req.amount, "uid": current_user.id})
    db.execute(text("INSERT INTO flow_trades (user_id, trade_type, shares, tc_amount, price) VALUES (:uid, 'sell', :sh, :amt, :p)"), {"uid": current_user.id, "sh": req.amount, "amt": tc_received, "p": price})
    db.commit()
    return {"shares_sold": req.amount, "tc_received": tc_received, "new_price": new_price, "new_tc_balance": get_user_coins(db, current_user.id)}

@router.post("/earn")
def earn_tc(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Award TC when lesson is completed - called from frontend"""
    amount = 0  # TC earned via lessons is tracked client-side; this syncs to DB
    db.execute(text("INSERT INTO user_coins (user_id, balance) VALUES (:uid, :amt) ON CONFLICT (user_id) DO UPDATE SET balance = user_coins.balance + :amt, updated_at = NOW()"), {"uid": current_user.id, "amt": amount})
    db.commit()
    return {"success": True}

@router.post("/award")
def award_tc(amount: float, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Award TC to user after completing a lesson"""
    if amount <= 0 or amount > 100:
        raise HTTPException(400, "Invalid amount")
    db.execute(text("INSERT INTO user_coins (user_id, balance) VALUES (:uid, :amt) ON CONFLICT (user_id) DO UPDATE SET balance = user_coins.balance + :amt, updated_at = NOW()"), {"uid": current_user.id, "amt": amount})
    db.commit()
    coins = get_user_coins(db, current_user.id)
    return {"tc_balance": coins}
