import os
import hashlib
import hmac
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from sqlalchemy.orm import Session
import httpx

from app.database.database import get_db
from app.database.models import User
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

SALT = "Traidable_salt_2025"
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "x7k_maple_29")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@Traidable.app")


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = ""

class LoginRequest(BaseModel):
    username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_admin: bool = False

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


def hash_password(password: str) -> str:
    return hashlib.sha256((SALT + password).encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hmac.compare_digest(hash_password(plain), hashed)

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(401, "Invalid token")
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or inactive")
    return user


async def send_reset_email(email: str, username: str, reset_token: str):
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — email not sent")
        return
    reset_link = f"https://Traidable-y1u6.onrender.com/reset?token={reset_token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0d1120;color:#e8edf8;border-radius:12px">
      <div style="font-size:28px;font-weight:800;color:#00e09e;margin-bottom:8px">Traidable</div>
      <h2 style="margin-bottom:16px">Password Reset Request</h2>
      <p style="color:#6b7fa3">Hi {username}, we received a request to reset your password.</p>
      <a href="{reset_link}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#00e09e;color:#000;font-weight:700;border-radius:8px;text-decoration:none">Reset Password</a>
      <p style="color:#6b7fa3;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={"from": FROM_EMAIL, "to": email, "subject": "Traidable — Reset your password", "html": html},
                timeout=10
            )
            if resp.status_code == 200:
                logger.info("Reset email sent to %s", email)
            else:
                logger.error("Resend error: %s", resp.text)
    except Exception as e:
        logger.error("Email send failed: %s", e)


@router.post("/register", response_model=UserResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if len(req.username) < 3:
        raise HTTPException(400, "Username must be at least 3 characters")
    if len(req.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(400, "Username already taken")
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(username=req.username, email=req.email,
                hashed_password=hash_password(req.password), full_name=req.full_name or "")
    db.add(user); db.commit(); db.refresh(user)
    logger.info("New user: %s", req.username)
    return user


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Incorrect username or password")
    if not user.is_active:
        raise HTTPException(403, "Account is disabled")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "is_admin": req.username == ADMIN_USERNAME}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        reset_token = create_access_token({"sub": str(user.id), "type": "reset"})
        await send_reset_email(user.email, user.username, reset_token)
        logger.info("Password reset sent: %s", req.email)
    return {"message": "If an account exists with that email, a reset link has been sent."}
