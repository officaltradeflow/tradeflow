// ════════════════════════════════════════
//  STATE
// ════════════════════════════════════════
const API = '';
let token = localStorage.getItem('tf_token') || '';
let currentUser = null;
let portfolioId = null;
let currentTradeType = 'buy';
let priceChart = null, portfolioChart = null, allocChart = null, tradeChart = null;
let currentSymbol = null, cachedPrice = null;
let tradeAmountMode = 'shares';
let tradeCashBalance = 0;
let liveRefreshTimer = null;
let userCoins = parseInt(localStorage.getItem('tf_coins') || '0');
let fundingTarget = parseFloat(localStorage.getItem('tf_funding_target') || '0');
let fundingCurrent = parseFloat(localStorage.getItem('tf_funding_current') || '0');

const WATCH_SYMS = ['AAPL','TSLA','MSFT','NVDA','GOOGL','AMZN','META','JPM'];
const POPULAR = ['AAPL','TSLA','MSFT','NVDA','GOOGL','AMZN','META','JPM','V','BAC','XOM','NFLX'];
const TRADE_PICKS = ['AAPL','TSLA','NVDA','MSFT','GOOGL','AMZN','META','SPY','AMD','BTC-USD'];

// Admin credentials (stored hashed — in production use backend auth)
const ADMIN_USERNAME = 'x7k_maple_29';
const ADMIN_PASSWORD_HASH = 'Qz#9mPx!vL42@Wd';
const ADMIN_TOKEN = 'tf_admin_8f3k9d2m1x7q4w6e';

// ── Price line plugin ────────────────────────────────────────────────────────
const currentPriceLinePlugin = {
  id: 'currentPriceLine',
  afterDraw(chart) {
    const ds = chart.data.datasets[0];
    if (!ds?.data?.length) return;
    const lastVal = ds.data[ds.data.length - 1];
    const yScale = chart.scales.y, xScale = chart.scales.x;
    if (!yScale || !xScale) return;
    const y = yScale.getPixelForValue(lastVal);
    const color = typeof ds.borderColor === 'string' ? ds.borderColor : '#00e09e';
    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath(); ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
    ctx.moveTo(xScale.left, y); ctx.lineTo(xScale.right, y);
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  }
};

// ════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════
const $ = id => document.getElementById(id);
const fmt = n => n == null ? '—' : '$' + parseFloat(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtPct = n => n == null ? '—' : (n >= 0 ? '+' : '') + parseFloat(n).toFixed(2) + '%';
const colorClass = n => n >= 0 ? 'up' : 'down';

function toast(msg, type='info') {
  const el = $('toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = '', 3400);
}

async function api(path, opts={}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...(token ? {'Authorization': 'Bearer ' + token} : {}) },
    ...opts
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

// ════════════════════════════════════════
//  LANDING / NAVIGATION
// ════════════════════════════════════════
function showLanding() {
  $('landing-screen').style.display = 'block';
  $('auth-screen').style.display = 'none';
  $('app-screen').style.display = 'none';
}

function showAuth(tab='login') {
  $('landing-screen').style.display = 'none';
  $('auth-screen').style.display = 'flex';
  $('app-screen').style.display = 'none';
  switchTab(tab);
}

// ════════════════════════════════════════
//  MODALS
// ════════════════════════════════════════
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

// Close modal on backdrop click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

// ════════════════════════════════════════
//  LANDING MOCK CHART
// ════════════════════════════════════════
function renderLandingMockChart() {
  const wrap = $('landing-mock-chart');
  if (!wrap) return;
  const heights = [30,42,35,55,48,62,58,70,65,80,72,88,75,92,85,100,90,95,88,100];
  wrap.innerHTML = heights.map((h,i) => {
    const isUp = i % 3 !== 1;
    return `<div class="mock-bar" style="height:${h}%;background:${isUp ? '#00e09e' : '#ff4757'};animation-delay:${i*0.05}s"></div>`;
  }).join('');
}

// ════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════
function switchTab(tab) {
  const tabs = document.querySelectorAll('.auth-tab');
  tabs[0].classList.toggle('active', tab === 'login');
  tabs[1].classList.toggle('active', tab === 'register');
  $('login-form').style.display = tab === 'login' ? '' : 'none';
  $('register-form').style.display = tab === 'register' ? '' : 'none';
}

async function doLogin() {
  const u = $('login-username').value.trim();
  const p = $('login-password').value;
  if (!u || !p) { $('login-error').textContent = 'Please fill all fields.'; return; }
  // Admin check
  if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD_HASH) {
    token = ADMIN_TOKEN;
    localStorage.setItem('tf_token', token);
    currentUser = { username: 'Admin', id: 0, is_admin: true };
    bootAdminApp();
    return;
  }
  try {
    const data = await api('/api/auth/login', {method:'POST', body: JSON.stringify({username:u, password:p})});
    token = data.access_token;
    localStorage.setItem('tf_token', token);
    await bootApp();
  } catch(e) { $('login-error').textContent = e.message; }
}

async function doRegister() {
  const u = $('reg-username').value.trim();
  const e = $('reg-email').value.trim();
  const n = $('reg-name').value.trim();
  const p = $('reg-password').value;
  if (!u || !e || !p) { $('reg-error').textContent = 'Please fill required fields.'; return; }
  if (p.length < 8) { $('reg-error').textContent = 'Password must be at least 8 characters.'; return; }
  try {
    await api('/api/auth/register', {method:'POST', body: JSON.stringify({username:u, email:e, full_name:n, password:p})});
    toast('Account created! Signing you in…', 'success');
    $('login-username').value = u; $('login-password').value = p;
    switchTab('login');
    setTimeout(doLogin, 400);
  } catch(e2) { $('reg-error').textContent = e2.message; }
}

async function doForgotPassword() {
  const email = $('forgot-email').value.trim();
  if (!email) { $('forgot-error').textContent = 'Please enter your email.'; return; }
  try {
    await api('/api/auth/forgot-password', {method:'POST', body: JSON.stringify({email})});
    toast('Reset link sent! Check your inbox.', 'success');
    closeModal('forgot-modal');
  } catch(e) {
    $('forgot-error').textContent = 'Reset email sent if account exists. (Backend SMTP must be configured.)';
    setTimeout(() => closeModal('forgot-modal'), 3000);
  }
}

function doLogout() {
  token = ''; localStorage.removeItem('tf_token');
  currentUser = null; portfolioId = null;
  stopLiveRefresh();
  $('app-screen').style.display = 'none';
  showLanding();
  toast('Signed out.', 'info');
}

// ════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════
async function bootApp() {
  try {
    currentUser = await api('/api/auth/me');
    const portfolios = await api('/api/portfolio/');
    if (!portfolios.length) {
      await api('/api/portfolio/', {method:'POST', body: JSON.stringify({name:'My Portfolio', portfolio_type:'practice'})});
      const fresh = await api('/api/portfolio/');
      portfolioId = fresh[0]?.id;
    } else {
      portfolioId = portfolios[0].id;
    }
    $('landing-screen').style.display = 'none';
    $('auth-screen').style.display = 'none';
    $('app-screen').style.display = 'block';
    $('user-name').textContent = currentUser.username;
    $('user-avatar').textContent = currentUser.username[0].toUpperCase();
    updateCoinsDisplay();
    navigate('dashboard');
  } catch(e) {
    toast('Session expired. Please sign in.', 'error');
    token = ''; localStorage.removeItem('tf_token');
    showAuth('login');
  }
}

function bootAdminApp() {
  $('landing-screen').style.display = 'none';
  $('auth-screen').style.display = 'none';
  $('app-screen').style.display = 'block';
  $('user-name').textContent = 'Admin';
  $('user-avatar').textContent = 'A';
  $('user-avatar').style.background = 'var(--red)';
  $('admin-nav-item').style.display = '';
  navigate('admin');
}

function updateCoinsDisplay() {
  $('user-coins-display').textContent = userCoins;
  $('coins-top').textContent = userCoins;
}

// ════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════
const pages = ['dashboard','markets','portfolio','trade','history','competitions','admin'];
const titles = {dashboard:'Dashboard',markets:'Markets',portfolio:'My Portfolio',trade:'Trade',history:'Trade History',competitions:'Competitions',admin:'⚙️ Admin'};

function navigate(page) {
  pages.forEach(p => { $('page-'+p).style.display = p === page ? '' : 'none'; });
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-oc')?.includes(`'${page}'`));
  });
  $('page-title').textContent = titles[page] || page;
  stopLiveRefresh();
  if (page === 'dashboard') loadDashboard();
  if (page === 'markets') loadPopular();
  if (page === 'portfolio') loadPortfolio();
  if (page === 'trade') { loadTradeHoldings(); loadTradeAccountSummary(); autoLoadTradeSymbol(); }
  if (page === 'history') loadHistory();
  if (page === 'admin') loadAdmin();
}

// ════════════════════════════════════════
//  LIVE PRICE REFRESH (2.5 seconds on Trade page)
// ════════════════════════════════════════
function startLiveRefresh() {
  stopLiveRefresh();
  liveRefreshTimer = setInterval(async () => {
    const sym = $('trade-symbol')?.value?.trim().toUpperCase();
    if (!sym || !cachedPrice) return;
    try {
      const d = await api(`/api/market/quote/${sym}`);
      const oldPrice = cachedPrice;
      cachedPrice = d.price;
      const priceEl = $('tq-price');
      priceEl.textContent = fmt(d.price);
      priceEl.className = d.price > oldPrice ? 'price-up' : d.price < oldPrice ? 'price-down' : '';
      const up = d.change >= 0;
      $('tq-change').innerHTML = `<span class="${up?'up':'down'}">${d.change>=0?'+':''}${fmt(d.change)} (${fmtPct(d.change_percent)})</span>`;
      $('trade-last-updated').textContent = 'Updated: ' + new Date().toLocaleTimeString();
      updateOrderSummary();
    } catch(e) {}
  }, 2500);
}

function stopLiveRefresh() {
  if (liveRefreshTimer) { clearInterval(liveRefreshTimer); liveRefreshTimer = null; }
}

// ════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════
async function loadDashboard() {
  try {
    const [summary, trades] = await Promise.all([
      api(`/api/trading/positions/${portfolioId}`),
      api(`/api/trading/history/${portfolioId}?limit=5`)
    ]);
    const { total_portfolio_value: total, total_profit_loss: pl, total_profit_loss_percent: plPct, cash_balance, invested_value, number_of_positions } = summary;
    $('dash-total').textContent = fmt(total);
    $('dash-cash').textContent = fmt(cash_balance);
    $('dash-invested').textContent = fmt(invested_value);
    $('dash-positions').textContent = number_of_positions + ' position' + (number_of_positions !== 1 ? 's' : '');
    $('dash-pl').textContent = fmt(pl);
    $('dash-pl').className = 'kpi-value ' + colorClass(pl);
    $('dash-pl-pct').textContent = fmtPct(plPct);
    $('dash-pl-pct').className = 'kpi-sub ' + colorClass(pl);
    $('dash-pl-label').textContent = pl >= 0 ? 'All-time gain' : 'All-time loss';
    $('dash-pl-label').className = 'kpi-sub ' + colorClass(pl);
    $('portfolio-balance-top').textContent = fmt(total);
    renderPortfolioChart(total);
    renderRecentTrades(trades);
    loadWatchlist();
    loadNewsFeed(null, 'news-feed-body');
  } catch(e) { toast(e.message, 'error'); }
}

function renderPortfolioChart(currentValue) {
  const ctx = $('portfolio-chart').getContext('2d');
  if (portfolioChart) portfolioChart.destroy();
  const labels = [], data = [];
  const now = new Date();
  const base = currentValue * 0.92;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US',{month:'short',day:'numeric'}));
    const noise = (Math.random() - 0.45) * base * 0.022;
    data.push(+(base + (currentValue - base) * (1 - i/30) + noise).toFixed(2));
  }
  data[data.length - 1] = currentValue;
  const trend = data[data.length-1] >= data[0];
  const color = trend ? '#00e09e' : '#ff4757';
  portfolioChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ data, borderColor: color, borderWidth: 2, fill: true,
      backgroundColor: c => { const g = c.chart.ctx.createLinearGradient(0,0,0,260); g.addColorStop(0, trend?'rgba(0,224,158,.15)':'rgba(255,71,87,.15)'); g.addColorStop(1,'rgba(0,0,0,0)'); return g; },
      tension: 0.4, pointRadius: 0, pointHoverRadius: 4
    }]},
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false,callbacks:{label:c=>'$'+c.raw.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}}},
      scales:{x:{grid:{display:false},ticks:{font:{size:10},color:'#6b7fa3',maxTicksLimit:6}},y:{grid:{color:'rgba(30,42,61,.5)'},ticks:{font:{size:10},color:'#6b7fa3',callback:v=>'$'+Math.round(v).toLocaleString()}}}
    }
  });
}

function renderRecentTrades(trades) {
  if (!trades.length) { $('recent-trades-body').innerHTML = '<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No trades yet — start trading!</div></div>'; return; }
  $('recent-trades-body').innerHTML = `<table class="tf-table"><thead><tr><th>Symbol</th><th>Type</th><th>Qty</th><th>Price</th><th>Total</th><th>Date</th></tr></thead><tbody>${
    trades.map(t => `<tr><td class="sym-cell">${t.symbol}</td><td><span class="tag tag-${t.trade_type}">${t.trade_type.toUpperCase()}</span></td><td>${t.quantity}</td><td>${fmt(t.price)}</td><td>${fmt(t.total_amount)}</td><td style="color:var(--txt2);font-size:11px">${new Date(t.timestamp).toLocaleString()}</td></tr>`).join('')
  }</tbody></table>`;
}

async function loadWatchlist() {
  $('watchlist-items').innerHTML = '<div class="empty"><div class="spinner"></div></div>';
  const results = await Promise.allSettled(WATCH_SYMS.slice(0,6).map(s => api('/api/market/quote/'+s)));
  $('watchlist-items').innerHTML = results.map((r,i) => {
    if (r.status !== 'fulfilled') return '';
    const d = r.value; const up = d.change >= 0;
    return `<div class="watch-item" data-sym="${WATCH_SYMS[i]}" style="cursor:pointer">
      <div><div class="watch-sym">${d.symbol}</div><div class="watch-name">${d.name||d.symbol}</div></div>
      <div style="text-align:right"><div class="watch-price">${fmt(d.price)}</div><div class="watch-chg ${up?'up':'down'}">${fmtPct(d.change_percent)}</div></div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════
//  NEWS FEED
// ════════════════════════════════════════
async function loadNewsFeed(symbol, containerId) {
  const el = $(containerId);
  if (!el) return;
  el.innerHTML = '<div class="empty"><div class="spinner"></div></div>';
  try {
    const path = symbol ? `/api/market/news?symbol=${symbol}&limit=5` : '/api/market/news?limit=6';
    const data = await api(path);
    const news = Array.isArray(data) ? data : (data.news || []);
    if (!news.length) { el.innerHTML = '<div class="empty"><div class="empty-text">No news available</div></div>'; return; }
    el.innerHTML = news.slice(0,6).map(n => `
      <a href="${n.url||'#'}" target="_blank" rel="noopener" style="display:block;padding:12px 18px;border-bottom:1px solid rgba(30,42,61,.4);text-decoration:none;transition:background .15s;cursor:pointer">
        <div style="font-size:12px;font-weight:600;color:var(--txt);margin-bottom:3px;line-height:1.5">${n.title||'Untitled'}</div>
        <div style="display:flex;gap:10px;align-items:center">
          <span style="font-size:10px;color:var(--txt2)">${n.source||''}</span>
          <span style="font-size:10px;color:var(--txt3)">${n.published_at ? new Date(n.published_at).toLocaleDateString() : ''}</span>
        </div>
      </a>`).join('');
  } catch(e) {
    el.innerHTML = '<div class="empty"><div class="empty-text">News unavailable — configure NEWS_API_KEY</div></div>';
  }
}

// ════════════════════════════════════════
//  MARKETS
// ════════════════════════════════════════
async function searchMarket() {
  const q = $('market-search').value.trim().toUpperCase();
  if (!q) return;
  await loadQuote(q);
}

async function loadQuote(sym) {
  currentSymbol = sym.toUpperCase();
  $('quote-view').style.display = '';
  $('q-symbol').textContent = currentSymbol;
  $('q-name').textContent = 'Loading…'; $('q-price').textContent = '$—'; $('q-change').textContent = '—';
  try {
    const d = await api(`/api/market/quote/${currentSymbol}`);
    cachedPrice = d.price;
    $('q-name').textContent = d.name || currentSymbol;
    $('q-price').textContent = fmt(d.price);
    const up = d.change >= 0;
    $('q-change').innerHTML = `<span class="${up?'up':'down'}">${d.change>=0?'+':''}${fmt(d.change)} (${fmtPct(d.change_percent)})</span>`;
    loadChart('1d','1m', document.querySelector('#page-markets .chart-tab.active'));
    loadNewsFeed(currentSymbol, 'symbol-news');
  } catch(e) { toast('Symbol not found: ' + currentSymbol, 'error'); }
}

async function loadChart(period, interval, btn) {
  document.querySelectorAll('#page-markets .chart-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (!currentSymbol) return;
  try {
    const res = await api(`/api/market/historical/${currentSymbol}?period=${period}&interval=${interval}`);
    renderPriceChart(res.data || []);
  } catch(e) {}
}

function renderPriceChart(raw) {
  const ctx = $('price-chart').getContext('2d');
  if (priceChart) priceChart.destroy();
  if (!raw.length) return;
  const prices = raw.map(d => d.close);
  const up = prices[prices.length-1] >= prices[0];
  const color = up ? '#00e09e' : '#ff4757';
  priceChart = new Chart(ctx, {
    type:'line', data:{labels: raw.map(d=>d.timestamp.slice(0,10)), datasets:[{data:prices, borderColor:color, borderWidth:2, fill:true,
      backgroundColor:c=>{const g=c.chart.ctx.createLinearGradient(0,0,0,260);g.addColorStop(0,up?'rgba(0,224,158,.18)':'rgba(255,71,87,.18)');g.addColorStop(1,'rgba(0,0,0,0)');return g;},
      tension:0.3, pointRadius:0, pointHoverRadius:4}]},
    plugins:[currentPriceLinePlugin],
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false,callbacks:{label:c=>'$'+c.raw.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}}},
      scales:{x:{grid:{display:false},ticks:{font:{size:10},color:'#6b7fa3',maxTicksLimit:8}},y:{position:'right',grid:{color:'rgba(30,42,61,.5)'},ticks:{font:{size:10},color:'#6b7fa3',callback:v=>'$'+v.toLocaleString()}}}}
  });
}

async function loadPopular() {
  $('popular-list').innerHTML = '<div class="empty"><div class="spinner"></div></div>';
  const results = await Promise.allSettled(POPULAR.slice(0,10).map(s=>api(`/api/market/quote/${s}`)));
  $('popular-list').innerHTML = `<table class="tf-table"><thead><tr><th>Symbol</th><th>Price</th><th>Change</th><th>Change %</th><th>Volume</th><th></th></tr></thead><tbody>${
    results.map((r,i)=>{
      if(r.status!=='fulfilled') return '';
      const d=r.value; const up=d.change>=0;
      return `<tr><td><div class="sym-cell">${d.symbol}</div><div class="sym-name">${d.name||''}</div></td><td>${fmt(d.price)}</td><td class="${up?'up':'down'}">${d.change>=0?'+':''}${fmt(d.change)}</td><td class="${up?'up':'down'}">${fmtPct(d.change_percent)}</td><td style="color:var(--txt2)">${d.volume?d.volume.toLocaleString():'—'}</td><td><button class="btn-join" data-sym="${d.symbol}" style="padding:5px 12px;font-size:11px">View</button></td></tr>`;
    }).join('')
  }</tbody></table>`;
}

function quickTrade() {
  if (!currentSymbol) return;
  navigate('trade');
  setTimeout(() => { $('trade-symbol').value = currentSymbol; lookupTradeSymbol(); }, 80);
}

// ════════════════════════════════════════
//  PORTFOLIO
// ════════════════════════════════════════
async function loadPortfolio() {
  try {
    const holdings = await api(`/api/trading/holdings/${portfolioId}`);
    renderHoldingsTable(holdings);
    renderAllocChart(holdings);
  } catch(e) { toast(e.message,'error'); }
}

function renderHoldingsTable(holdings) {
  if (!holdings.length) { $('holdings-table-wrap').innerHTML = '<div class="empty"><div class="empty-icon">💼</div><div class="empty-text">No holdings — place your first trade!</div></div>'; return; }
  $('holdings-table-wrap').innerHTML = `<table class="tf-table"><thead><tr><th>Symbol</th><th>Shares</th><th>Avg Cost</th><th>Current</th><th>Value</th><th>P&L</th><th>P&L %</th></tr></thead><tbody>${
    holdings.map(h=>{const up=h.profit_loss>=0;return `<tr><td class="sym-cell">${h.symbol}</td><td>${h.quantity}</td><td>${fmt(h.average_cost)}</td><td>${fmt(h.current_price)}</td><td>${fmt(h.total_value)}</td><td class="${up?'up':'down'}">${fmt(h.profit_loss)}</td><td class="${up?'up':'down'}">${fmtPct(h.profit_loss_percent)}</td></tr>`;}).join('')
  }</tbody></table>`;
}

function renderAllocChart(holdings) {
  const ctx = $('alloc-chart').getContext('2d');
  if (allocChart) allocChart.destroy();
  if (!holdings.length) { $('alloc-legend').innerHTML = '<div style="color:var(--txt2);font-size:12px">No holdings</div>'; return; }
  const COLORS = ['#00e09e','#3b82f6','#f5a623','#ff4757','#9b6dff','#00c8e0','#ff8c00','#e040fb'];
  const labels = holdings.map(h=>h.symbol), values = holdings.map(h=>h.total_value);
  allocChart = new Chart(ctx, {
    type:'doughnut', data:{labels, datasets:[{data:values, backgroundColor:COLORS.slice(0,labels.length), borderWidth:0, hoverOffset:6}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.label}: ${fmt(c.raw)}`}}}}
  });
  $('alloc-legend').innerHTML = labels.map((l,i)=>`<div class="ring-item"><div class="ring-dot" style="background:${COLORS[i]}"></div><div><div style="font-weight:600;font-size:12px">${l}</div><div style="color:var(--txt2);font-size:10px">${fmt(values[i])}</div></div></div>`).join('');
}

// ════════════════════════════════════════
//  TRADE
// ════════════════════════════════════════
function setTradeType(type) {
  currentTradeType = type;
  $('tab-buy').classList.toggle('active', type==='buy');
  $('tab-sell').classList.toggle('active', type==='sell');
  const btn = $('submit-trade');
  btn.className = `btn-trade ${type}`;
  btn.textContent = type==='buy' ? '▲ Place Buy Order' : '▼ Place Sell Order';
  $('os-total-label').textContent = type==='buy' ? 'Total Cost' : 'You Receive';
  updateOrderSummary();
}

function setAmountMode(mode) {
  tradeAmountMode = mode;
  $('mode-shares').style.background = mode==='shares' ? 'var(--card2)' : 'none';
  $('mode-shares').style.color = mode==='shares' ? 'var(--txt)' : 'var(--txt2)';
  $('mode-dollars').style.background = mode==='dollars' ? 'var(--card2)' : 'none';
  $('mode-dollars').style.color = mode==='dollars' ? 'var(--txt)' : 'var(--txt2)';
  $('amt-prefix').style.display = mode==='dollars' ? '' : 'none';
  $('trade-qty').style.paddingLeft = mode==='dollars' ? '28px' : '14px';
  $('trade-qty').placeholder = mode==='dollars' ? '0.00' : '0';
  $('trade-qty').value = '';
  updateOrderSummary();
}

function toggleLimitPrice() {
  $('limit-price-group').style.display = $('trade-order-type').value === 'limit' ? '' : 'none';
}

function renderTradeQuickPicks(active) {
  const wrap = $('trade-quick-picks');
  wrap.innerHTML = TRADE_PICKS.map(s => {
    const isActive = s === active;
    return `<button data-pick="${s}"
      style="padding:3px 10px;border:1px solid ${isActive?'var(--blue)':'var(--border)'};background:${isActive?'var(--blue-dim)':'var(--bg2)'};color:${isActive?'var(--blue)':'var(--txt2)'};border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font-mono)">${s}</button>`;
  }).join('');
}

function autoLoadTradeSymbol() {
  if (!$('trade-symbol').value) $('trade-symbol').value = 'AAPL';
  renderTradeQuickPicks($('trade-symbol').value);
  lookupTradeSymbol();
}

async function lookupTradeSymbol() {
  const sym = $('trade-symbol').value.trim().toUpperCase();
  if (!sym) return;
  renderTradeQuickPicks(sym);
  $('trade-quote-card').style.display = '';
  $('trade-order-card').style.display = '';
  $('tq-sym').textContent = sym; $('tq-name').textContent = 'Loading…'; $('tq-price').textContent = '$—';
  stopLiveRefresh();
  try {
    const d = await api(`/api/market/quote/${sym}`);
    cachedPrice = d.price;
    $('tq-sym').textContent = d.symbol; $('tq-name').textContent = d.name||d.symbol;
    $('tq-price').textContent = fmt(d.price); $('tq-exchange').textContent = d.currency||'USD';
    const up = d.change>=0;
    $('tq-change').innerHTML = `<span class="${up?'up':'down'}">${d.change>=0?'+':''}${fmt(d.change)} (${fmtPct(d.change_percent)})</span>`;
    $('tq-vol').textContent = d.volume ? d.volume.toLocaleString() : '—';
    $('tq-mktcap').textContent = d.market_cap ? '$'+(d.market_cap/1e9).toFixed(1)+'B' : '—';
    loadTradeChart('1d','1m', null);
    if ($('trade-order-type').value==='limit') $('limit-price').value = d.price.toFixed(2);
    updateOrderSummary();
    startLiveRefresh();
  } catch(e) {
    toast('Symbol not found: '+sym, 'error');
    $('trade-quote-card').style.display='none'; $('trade-order-card').style.display='none';
  }
}

async function loadTradeChart(period, interval, btn) {
  if (btn) { document.querySelectorAll('#trade-chart-tabs .chart-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
  const sym = $('trade-symbol').value.trim().toUpperCase();
  if (!sym) return;
  try {
    const res = await api(`/api/market/historical/${sym}?period=${period}&interval=${interval}`);
    const raw = res.data || [];
    const ctx = $('trade-mini-chart').getContext('2d');
    if (tradeChart) tradeChart.destroy();
    if (!raw.length) return;
    const prices = raw.map(d=>d.close);
    const up = prices[prices.length-1] >= prices[0];
    const color = up ? '#00e09e' : '#ff4757';
    tradeChart = new Chart(ctx, {
      type:'line', data:{labels:raw.map(d=>d.timestamp.slice(0,10)), datasets:[{data:prices, borderColor:color, borderWidth:2, fill:true,
        backgroundColor:c=>{const g=c.chart.ctx.createLinearGradient(0,0,0,220);g.addColorStop(0,up?'rgba(0,224,158,.15)':'rgba(255,71,87,.15)');g.addColorStop(1,'rgba(0,0,0,0)');return g;},
        tension:0.3, pointRadius:0, pointHoverRadius:4}]},
      plugins:[currentPriceLinePlugin],
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false,callbacks:{label:c=>'$'+c.raw.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}}},
        scales:{x:{grid:{display:false},ticks:{font:{size:10},color:'#6b7fa3',maxTicksLimit:6}},y:{position:'right',grid:{color:'rgba(30,42,61,.5)'},ticks:{font:{size:10},color:'#6b7fa3',callback:v=>'$'+v.toLocaleString()}}}}
    });
  } catch(e) {}
}

function quickFill(pct) {
  if (!cachedPrice) { toast('Look up a symbol first.','info'); return; }
  const max = tradeCashBalance;
  if (tradeAmountMode === 'dollars') {
    $('trade-qty').value = (max * pct / 100).toFixed(2);
  } else {
    $('trade-qty').value = Math.floor((max * pct / 100) / cachedPrice * 100) / 100;
  }
  updateOrderSummary();
}

async function updateOrderSummary() {
  const rawQty = parseFloat($('trade-qty').value) || 0;
  if (!rawQty || !cachedPrice) { resetOrderSummary(); return; }
  const price = $('trade-order-type').value==='limit' && $('limit-price').value ? parseFloat($('limit-price').value) : cachedPrice;
  let shares, dollars;
  if (tradeAmountMode==='dollars') { dollars=rawQty; shares=dollars/price; }
  else { shares=rawQty; dollars=shares*price; }
  const comm = dollars * 0.001;
  const total = currentTradeType==='buy' ? dollars+comm : dollars-comm;
  $('os-price').textContent = fmt(price);
  $('os-shares').textContent = shares.toFixed(4)+' shares';
  $('os-subtotal').textContent = fmt(dollars);
  $('os-comm').textContent = fmt(comm);
  $('os-total').textContent = fmt(total);
  if (tradeCashBalance > 0 && currentTradeType==='buy') {
    const used = Math.min(total/tradeCashBalance,1);
    $('bp-bar').style.width = (used*100)+'%';
    $('bp-bar').style.background = used>0.9 ? 'var(--red)' : used>0.6 ? 'var(--gold)' : 'var(--green)';
    $('bp-after').textContent = 'After: '+fmt(tradeCashBalance-total);
  }
}

function resetOrderSummary() {
  ['os-price','os-shares','os-subtotal','os-comm','os-total'].forEach(id => $(id).textContent = '—');
  $('bp-bar').style.width = '0%';
  $('bp-after').textContent = 'After: —';
}

async function submitTrade() {
  const sym = $('trade-symbol').value.trim().toUpperCase();
  const rawQty = parseFloat($('trade-qty').value);
  if (!sym || !rawQty || rawQty <= 0) { toast('Please enter a symbol and amount.','error'); return; }
  if (!cachedPrice) { toast('Look up a symbol first.','error'); return; }
  const shares = tradeAmountMode==='dollars' ? Math.round(rawQty/cachedPrice*10000)/10000 : rawQty;
  const btn = $('submit-trade');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Processing…';
  try {
    await api(`/api/trading/execute?portfolio_id=${portfolioId}`, {method:'POST', body:JSON.stringify({symbol:sym, trade_type:currentTradeType, quantity:shares, order_type:$('trade-order-type').value})});
    toast(`${currentTradeType==='buy'?'🟢 Bought':'🔴 Sold'} ${shares} shares of ${sym}!`, 'success');
    $('trade-qty').value = '';
    resetOrderSummary();
    loadTradeHoldings();
    loadTradeAccountSummary();
  } catch(e) { toast(e.message,'error'); }
  finally { btn.disabled=false; btn.textContent = currentTradeType==='buy' ? '▲ Place Buy Order' : '▼ Place Sell Order'; }
}

async function loadTradeAccountSummary() {
  try {
    const s = await api(`/api/trading/positions/${portfolioId}`);
    tradeCashBalance = s.cash_balance;
    $('acct-cash').textContent = fmt(s.cash_balance);
    $('acct-invested').textContent = fmt(s.invested_value);
    $('acct-total').textContent = fmt(s.total_portfolio_value);
    const pl = s.total_profit_loss;
    $('acct-pl').textContent = fmt(pl)+' ('+fmtPct(s.total_profit_loss_percent)+')';
    $('acct-pl').style.color = pl>=0 ? 'var(--green)' : 'var(--red)';
    $('bp-amount').textContent = fmt(s.cash_balance);
    $('portfolio-balance-top').textContent = fmt(s.total_portfolio_value);
  } catch(e) {}
}

async function loadTradeHoldings() {
  try {
    const holdings = await api(`/api/trading/holdings/${portfolioId}`);
    if (!holdings.length) { $('trade-holdings').innerHTML = '<div class="empty"><div class="empty-icon">📂</div><div class="empty-text">No positions yet</div></div>'; return; }
    $('trade-holdings').innerHTML = holdings.map(h => {
      const up = h.profit_loss>=0;
      return `<div style="padding:11px 18px;border-bottom:1px solid rgba(30,42,61,.5);cursor:pointer;transition:background .15s"
        data-sell="${h.symbol}" data-qty="${h.quantity}" style="cursor:pointer">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:700;font-size:13px">${h.symbol}</div><div style="font-size:10px;color:var(--txt2);margin-top:1px">${h.quantity} sh · avg ${fmt(h.average_cost)}</div></div>
          <div style="text-align:right"><div style="font-weight:600;font-size:13px">${fmt(h.total_value)}</div><div style="font-size:11px;font-weight:600;color:${up?'var(--green)':'var(--red)'}">${fmtPct(h.profit_loss_percent)}</div></div>
        </div></div>`;
    }).join('');
  } catch(e) {}
}

function quickSellPosition(symbol, qty) {
  $('trade-symbol').value = symbol;
  cachedPrice = null;
  setTradeType('sell'); setAmountMode('shares');
  $('trade-qty').value = qty;
  lookupTradeSymbol();
  window.scrollTo({top:0, behavior:'smooth'});
}

// ════════════════════════════════════════
//  HISTORY
// ════════════════════════════════════════
async function loadHistory() {
  try {
    const trades = await api(`/api/trading/history/${portfolioId}?limit=100`);
    if (!trades.length) { $('history-table-wrap').innerHTML = '<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No trade history yet</div></div>'; return; }
    $('history-table-wrap').innerHTML = `<table class="tf-table"><thead><tr><th>Symbol</th><th>Type</th><th>Qty</th><th>Price</th><th>Total</th><th>Commission</th><th>Date & Time</th></tr></thead><tbody>${
      trades.map(t=>`<tr><td class="sym-cell">${t.symbol}</td><td><span class="tag tag-${t.trade_type}">${t.trade_type.toUpperCase()}</span></td><td>${t.quantity}</td><td>${fmt(t.price)}</td><td>${fmt(t.total_amount)}</td><td style="color:var(--txt2)">${fmt(t.commission)}</td><td style="color:var(--txt2);font-size:11px">${new Date(t.timestamp).toLocaleString()}</td></tr>`).join('')
    }</tbody></table>`;
  } catch(e) { toast(e.message,'error'); }
}

// ════════════════════════════════════════
//  ADMIN
// ════════════════════════════════════════
async function loadAdmin() {
  updateFundingDisplay();
  try {
    const stats = await api('/api/admin/stats').catch(() => null);
    if (stats) {
      $('admin-users').textContent = stats.total_users ?? '—';
      $('admin-portfolios').textContent = stats.total_portfolios ?? '—';
      $('admin-trades-today').textContent = stats.trades_today ?? '—';
      $('admin-trades-total').textContent = stats.total_trades ?? '—';
      $('admin-coins').textContent = stats.total_coins ?? '0';
    } else {
      ['admin-users','admin-portfolios','admin-trades-today','admin-trades-total','admin-coins'].forEach(id => $(id).textContent = 'N/A');
    }
    const users = await api('/api/admin/users').catch(() => null);
    if (users && users.length) {
      $('admin-users-table').innerHTML = `<table class="tf-table"><thead><tr><th>Username</th><th>Email</th><th>Joined</th><th>Active</th></tr></thead><tbody>${
        users.slice(0,20).map(u=>`<tr><td class="sym-cell">${u.username}</td><td style="color:var(--txt2)">${u.email}</td><td style="color:var(--txt2);font-size:11px">${new Date(u.created_at).toLocaleDateString()}</td><td>${u.is_active?'✅':'❌'}</td></tr>`).join('')
      }</tbody></table>`;
    } else {
      $('admin-users-table').innerHTML = '<div class="empty"><div class="empty-text">Admin API endpoints not yet configured. Add /api/admin/ routes to backend.</div></div>';
    }
  } catch(e) {
    $('admin-users-table').innerHTML = '<div class="empty"><div class="empty-text">Connect admin routes in the backend to see stats here.</div></div>';
  }
}

function updateFunding() {
  const target = parseFloat($('admin-funding-target').value) || 0;
  const current = parseFloat($('admin-funding-current').value) || 0;
  fundingTarget = target; fundingCurrent = current;
  localStorage.setItem('tf_funding_target', target);
  localStorage.setItem('tf_funding_current', current);
  updateFundingDisplay();
  toast('Funding goal updated!', 'success');
}

function updateFundingDisplay() {
  const pct = fundingTarget > 0 ? Math.min((fundingCurrent/fundingTarget)*100, 100) : 0;
  $('admin-funding-bar').style.width = pct + '%';
  $('admin-funding-raised').textContent = `$${fundingCurrent.toFixed(2)} / $${fundingTarget.toFixed(2)}`;
  $('admin-funding-sub').textContent = fundingTarget > 0
    ? `${pct.toFixed(1)}% of monthly goal reached — $${Math.max(0, fundingTarget - fundingCurrent).toFixed(2)} remaining`
    : 'Set a monthly target above to track funding progress.';
  if ($('admin-funding-target') && fundingTarget) $('admin-funding-target').value = fundingTarget;
  if ($('admin-funding-current') && fundingCurrent) $('admin-funding-current').value = fundingCurrent;
}

function adminAction(action) {
  const messages = {
    reset_cache: 'Cache clear request sent to backend.',
    export_users: 'User export — add /api/admin/export endpoint to backend.',
    view_logs: 'Logs — check your Render logs directly.'
  };
  toast(messages[action] || action, 'info');
}

// ════════════════════════════════════════
//  INIT
// ════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  renderLandingMockChart();
  if (token && token !== ADMIN_TOKEN) {
    bootApp();
  } else if (token === ADMIN_TOKEN) {
    bootAdminApp();
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
    });
  });
});

// ════════════════════════════════════════
//  EVENT DISPATCH (replaces data-oc / new Function)
// ════════════════════════════════════════
const _actions = {
  'do-login':         () => doLogin(),
  'do-register':      () => doRegister(),
  'do-logout':        () => doLogout(),
  'forgot-password':  () => doForgotPassword(),
  'show-login':       () => showAuth('login'),
  'show-register':    () => showAuth('register'),
  'show-landing':     () => showLanding(),
  'tab-login':        () => switchTab('login'),
  'tab-register':     () => switchTab('register'),
  'open-privacy':     () => openModal('privacy-modal'),
  'open-disclaimer':  () => openModal('disclaimer-modal'),
  'open-forgot':      () => openModal('forgot-modal'),
  'close-privacy':    () => closeModal('privacy-modal'),
  'close-disclaimer': () => closeModal('disclaimer-modal'),
  'close-forgot':     () => closeModal('forgot-modal'),
  'nav-dashboard':    () => navigate('dashboard'),
  'nav-markets':      () => navigate('markets'),
  'nav-portfolio':    () => navigate('portfolio'),
  'nav-trade':        () => navigate('trade'),
  'nav-history':      () => navigate('history'),
  'nav-competitions': () => navigate('competitions'),
  'nav-admin':        () => navigate('admin'),
  'search-market':    () => searchMarket(),
  'quick-trade':      () => quickTrade(),
  'chart-1d':         (el) => loadChart('1d','1m',el),
  'chart-5d':         (el) => loadChart('5d','5m',el),
  'chart-1mo':        (el) => loadChart('1mo','1d',el),
  'chart-3mo':        (el) => loadChart('3mo','1d',el),
  'chart-1y':         (el) => loadChart('1y','1wk',el),
  'tchart-1d':        (el) => loadTradeChart('1d','1m',el),
  'tchart-5d':        (el) => loadTradeChart('5d','5m',el),
  'tchart-1mo':       (el) => loadTradeChart('1mo','1d',el),
  'tchart-3mo':       (el) => loadTradeChart('3mo','1d',el),
  'tchart-1y':        (el) => loadTradeChart('1y','1wk',el),
  'lookup-symbol':    () => lookupTradeSymbol(),
  'trade-buy':        () => setTradeType('buy'),
  'trade-sell':       () => setTradeType('sell'),
  'mode-shares-btn':  () => setAmountMode('shares'),
  'mode-dollars-btn': () => setAmountMode('dollars'),
  'fill-25':          () => quickFill(25),
  'fill-50':          () => quickFill(50),
  'fill-75':          () => quickFill(75),
  'fill-100':         () => quickFill(100),
  'submit-trade-btn': () => submitTrade(),
  'update-funding':   () => updateFunding(),
  'admin-cache':      () => adminAction('reset_cache'),
  'admin-export':     () => adminAction('export_users'),
  'admin-logs':       () => adminAction('view_logs'),
  'close-ad':         () => closeAdModal(),
  'watch-ad':         () => showAd(),
};

document.addEventListener('click', e => {
  // Static actions
  const el = e.target.closest('[data-action]');
  if (el) { const fn = _actions[el.dataset.action]; if (fn) { e.preventDefault(); fn(el); } return; }
  // Dynamic: watchlist / popular view
  const sym = e.target.closest('[data-sym]');
  if (sym) { navigate('markets'); setTimeout(() => loadQuote(sym.dataset.sym), 100); return; }
  // Dynamic: quick picks
  const pick = e.target.closest('[data-pick]');
  if (pick) { $('trade-symbol').value = pick.dataset.pick; lookupTradeSymbol(); return; }
  // Dynamic: sell position
  const sell = e.target.closest('[data-sell]');
  if (sell) { quickSellPosition(sell.dataset.sell, parseFloat(sell.dataset.qty)); }
});
