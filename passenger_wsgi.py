import os
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Path setup ────────────────────────────────────────────────────────────────
project_home = "/home/Stocksimulater/trading_simulator"
if project_home not in sys.path:
    sys.path.insert(0, project_home)

os.chdir(project_home)

# ── Import app ────────────────────────────────────────────────────────────────
from app.main import app  # noqa: E402

application = app
logger.info("TradeFlow v2.0.0 started on PythonAnywhere")
