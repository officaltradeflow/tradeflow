from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

from app.database.database import get_db
from app.database.models import Competition, CompetitionParticipation, Portfolio, User, Holding
from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.services.data_service import DataService

router = APIRouter()
logger = logging.getLogger(__name__)
_data_service = DataService()


# ── Schemas ───────────────────────────────────────────────────────────────────

class CompetitionCreate(BaseModel):
    name: str
    description: str = ""
    start_date: datetime
    end_date: datetime
    entry_fee: float = 0.0
    prize_pool: float = 0.0
    max_participants: Optional[int] = None


class CompetitionResponse(BaseModel):
    id: int
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    entry_fee: float
    prize_pool: float
    max_participants: Optional[int]
    is_active: bool
    participant_count: int = 0

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    portfolio_value: float
    profit_loss: float
    profit_loss_percent: float


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[CompetitionResponse])
def list_competitions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comps = db.query(Competition).filter(Competition.is_active == True).all()
    result = []
    for c in comps:
        count = db.query(CompetitionParticipation).filter(
            CompetitionParticipation.competition_id == c.id
        ).count()
        r = CompetitionResponse(
            id=c.id, name=c.name, description=c.description,
            start_date=c.start_date, end_date=c.end_date,
            entry_fee=c.entry_fee, prize_pool=c.prize_pool,
            max_participants=c.max_participants, is_active=c.is_active,
            participant_count=count
        )
        result.append(r)
    return result


@router.post("/", response_model=CompetitionResponse, status_code=201)
def create_competition(
    req: CompetitionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin-only endpoint to create competitions."""
    comp = Competition(
        name=req.name, description=req.description,
        start_date=req.start_date, end_date=req.end_date,
        entry_fee=req.entry_fee, prize_pool=req.prize_pool,
        max_participants=req.max_participants
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return CompetitionResponse(**comp.__dict__, participant_count=0)


@router.post("/{competition_id}/join")
def join_competition(
    competition_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comp = db.query(Competition).filter(Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(404, "Competition not found")
    if not comp.is_active:
        raise HTTPException(400, "Competition is not active")

    # Check max participants
    if comp.max_participants:
        count = db.query(CompetitionParticipation).filter(
            CompetitionParticipation.competition_id == competition_id
        ).count()
        if count >= comp.max_participants:
            raise HTTPException(400, "Competition is full")

    # Already joined?
    existing = db.query(CompetitionParticipation).filter(
        CompetitionParticipation.competition_id == competition_id,
        CompetitionParticipation.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(400, "You have already joined this competition")

    # Use first portfolio
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(400, "You need a portfolio to join a competition")

    participation = CompetitionParticipation(
        competition_id=competition_id,
        user_id=current_user.id,
        portfolio_id=portfolio.id
    )
    db.add(participation)
    db.commit()
    return {"message": "Successfully joined competition"}


@router.get("/{competition_id}/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    competition_id: int,
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comp = db.query(Competition).filter(Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(404, "Competition not found")

    participations = db.query(CompetitionParticipation).filter(
        CompetitionParticipation.competition_id == competition_id
    ).all()

    entries = []
    for p in participations:
        portfolio = db.query(Portfolio).filter(Portfolio.id == p.portfolio_id).first()
        user = db.query(User).filter(User.id == p.user_id).first()
        if not portfolio or not user:
            continue

        # Calculate current portfolio value
        holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
        invested = 0.0
        for h in holdings:
            try:
                quote = await _data_service.fetch_quote(h.symbol)
                price = quote["price"] if quote else h.current_price
            except Exception:
                price = h.current_price
            invested += h.quantity * price

        total = portfolio.current_balance + invested
        pl = total - portfolio.initial_balance
        pl_pct = (pl / portfolio.initial_balance * 100) if portfolio.initial_balance else 0

        entries.append({
            "username": user.username,
            "portfolio_value": round(total, 2),
            "profit_loss": round(pl, 2),
            "profit_loss_percent": round(pl_pct, 2)
        })

    # Sort by portfolio value descending
    entries.sort(key=lambda x: x["portfolio_value"], reverse=True)

    return [
        LeaderboardEntry(rank=i + 1, **e)
        for i, e in enumerate(entries[:limit])
    ]
