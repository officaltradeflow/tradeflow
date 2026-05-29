from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.database.database import get_db
from app.database.models import Portfolio, User
from app.core.config import settings
from app.api.routes.auth import get_current_user

router = APIRouter()


class PortfolioCreate(BaseModel):
    name: str
    portfolio_type: str = "practice"  # "practice" | "competitive"

class PortfolioResponse(BaseModel):
    id: int
    name: str
    portfolio_type: str
    initial_balance: float
    current_balance: float
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[PortfolioResponse])
def list_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()


@router.post("/", response_model=PortfolioResponse, status_code=201)
def create_portfolio(
    req: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    initial = (
        settings.PRACTICE_PORTFOLIO_AMOUNT
        if req.portfolio_type == "practice"
        else settings.COMPETITIVE_PORTFOLIO_AMOUNT
    )
    portfolio = Portfolio(
        user_id=current_user.id,
        name=req.name,
        portfolio_type=req.portfolio_type,
        initial_balance=initial,
        current_balance=initial,
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    p = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    if not p:
        raise HTTPException(404, "Portfolio not found")
    return p


@router.delete("/{portfolio_id}", status_code=204)
def delete_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    p = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    if not p:
        raise HTTPException(404, "Portfolio not found")
    db.delete(p)
    db.commit()
