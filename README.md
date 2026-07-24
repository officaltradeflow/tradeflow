# TradeFlow v2.0.0

Stock trading simulator — real market data, virtual money.

**Live:** https://tradeflow-y1u6.onrender.com

## Stack
- **Backend:** FastAPI + SQLAlchemy
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Render.com (free tier)
- **Frontend:** Vanilla JS + Chart.js

## Setup

### 1. Clone & install
```bash
git clone https://github.com/officaltradeflow/tradeflow
pip install -r requirements.txt
```

### 2. Environment variables (Render)
| Key | Value |
|---|---|
| `DATABASE_URL` | Supabase session pooler URL |
| `SECRET_KEY` | Random string |
| `PYTHON_VERSION` | `3.11.0` |
| `ADMIN_TOKEN` | Random string |
| `BOT_PASSWORD` | Bot account password |

### 3. Start
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Features
- Live market data (Yahoo Finance)
- Buy/sell with virtual $100k
- AI trader bot (keeps site alive)
- FlowCoin (FLOW) TC market
- hCaptcha protection
- Admin dashboard
- Security headers (CSP, HSTS, etc.)

## Notes
- Prices refresh every 2.5s on Trade page
- AI bot trades every 1–3 min
- hCaptcha site key: replace in `index.html`
- Forgot password needs SMTP config in `auth.py`
## Notes
- SQLite database is created automatically at first run
- WebSocket real-time updates may be limited on PythonAnywhere free tier
- Yahoo Finance data may occasionally be rate-limited; the cache (5 min TTL) reduces this
- The Competitions page is intentionally locked with a "Still In Development" banner
