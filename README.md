# TradeFlow v2.0.0 — Deployment Guide

## What's New in v2.0.0
- ✅ Landing / marketing page (before login)
- ✅ hCaptcha on login & register forms
- ✅ Forgot password endpoint (needs SMTP config)
- ✅ Encrypted passwords (bcrypt)
- ✅ Privacy Policy & Disclaimer modals
- ✅ Simulation disclaimer banner throughout
- ✅ Buy/sell form side-by-side with chart on Trade page
- ✅ Live price refresh every 2–3 seconds on Trade page
- ✅ Market news feed (Yahoo Finance fallback, NewsAPI optional)
- ✅ "Still In Development" tape over Competitions page
- ✅ TradeCoins currency framework (ready for ad integration)
- ✅ Admin page (username: admin, password: set below)
- ✅ Funding progress bar (admin-controlled)
- ✅ SPA catch-all route for client-side navigation

---

## 1. Upload Files

Upload everything to: `/home/Stocksimulater/trading_simulator/`

Structure:
```
trading_simulator/
├── app/
│   ├── main.py
│   ├── core/config.py
│   ├── api/routes/  (auth, trading, portfolio, competitions, market_data, admin)
│   ├── database/    (database.py, models.py)
│   ├── services/    (data_service.py)
│   └── websocket/   (connection_manager.py)
├── static/
│   └── index.html   ← put the frontend here
├── passenger_wsgi.py
└── requirements.txt
```

---

## 2. Virtual Environment

```bash
cd /home/Stocksimulater/trading_simulator
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 3. PythonAnywhere Web Tab

| Setting | Value |
|---|---|
| WSGI file | `/home/Stocksimulater/trading_simulator/passenger_wsgi.py` |
| Working dir | `/home/Stocksimulater/trading_simulator/` |
| Virtualenv | `/home/Stocksimulater/trading_simulator/venv/` |

Static files mapping:
| URL | Directory |
|---|---|
| `/static/` | `/home/Stocksimulater/trading_simulator/static/` |

---

## 4. Environment Variables (Web Tab → Environment Variables)

| Variable | Value | Required |
|---|---|---|
| `SECRET_KEY` | Long random string | ✅ Yes |
| `NEWS_API_KEY` | From newsapi.org (free tier) | Optional |
| `ALPHA_VANTAGE_API_KEY` | From alphavantage.co | Optional |

Generate a secret key:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---


## 6. hCaptcha Setup (Free)

1. Go to https://www.hcaptcha.com and create a free account
2. Add your site (use `Stocksimulater.pythonanywhere.com`)
3. Get your **Site Key**
4. In `static/index.html`, replace both instances of:
   ```
   data-sitekey="10000000-ffff-ffff-ffff-000000000001"
   ```
   with your actual site key. The current value is hCaptcha's test key (always passes).
5. Add your **Secret Key** to the backend for server-side verification (optional but recommended)

---

## 7. Forgot Password / Email Setup

To enable real password reset emails:
1. Get SMTP credentials (Gmail, SendGrid, etc.)
2. In `app/api/routes/auth.py`, uncomment and implement the email sending code in `forgot_password()`
3. Add these environment variables:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `FROM_EMAIL`

---

## 8. News Feed

- **Free (default):** Uses Yahoo Finance news — no API key needed
- **Better quality:** Sign up at https://newsapi.org (free tier: 100 requests/day)
  - Add `NEWS_API_KEY=your_key` to environment variables

---

## 9. Reload & Test

Click **Reload** in PythonAnywhere Web tab, then visit:
- `https://Stocksimulater.pythonanywhere.com/` — landing page
- `https://Stocksimulater.pythonanywhere.com/api/docs` — API docs
- `https://Stocksimulater.pythonanywhere.com/health` — health check

---

## Notes
- SQLite database is created automatically at first run
- WebSocket real-time updates may be limited on PythonAnywhere free tier
- Yahoo Finance data may occasionally be rate-limited; the cache (5 min TTL) reduces this
- The Competitions page is intentionally locked with a "Still In Development" banner
