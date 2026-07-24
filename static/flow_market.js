// ═══════════════════════════════════
//  FLOW Market Engine
//  FlowCoin (FLOW) — price driven by user buy/sell
// ═══════════════════════════════════

const FLOW = {
  symbol: 'FLOW',
  name: 'FlowCoin',
  price: parseFloat(localStorage.getItem('flow_price') || '100'),
  supply: parseFloat(localStorage.getItem('flow_supply') || '1000000'),
  history: JSON.parse(localStorage.getItem('flow_history') || '[]'),

  save() {
    localStorage.setItem('flow_price', this.price);
    localStorage.setItem('flow_supply', this.supply);
    localStorage.setItem('flow_history', JSON.stringify(this.history.slice(-100)));
  },

  buy(tcAmount) {
    const shares = tcAmount / this.price;
    this.price = +(this.price * (1 + (tcAmount / this.supply) * 0.1)).toFixed(4);
    this.supply += tcAmount;
    this._record();
    this.save();
    return shares;
  },

  sell(shares) {
    const tcAmount = shares * this.price;
    this.price = +(this.price * (1 - (tcAmount / this.supply) * 0.1)).toFixed(4);
    if (this.price < 1) this.price = 1;
    this.supply -= tcAmount;
    this._record();
    this.save();
    return tcAmount;
  },

  _record() {
    this.history.push({ t: Date.now(), p: this.price });
  }
};

// User FLOW holdings
function getFlowHoldings() {
  return parseFloat(localStorage.getItem('flow_holdings') || '0');
}
function setFlowHoldings(v) {
  localStorage.setItem('flow_holdings', v);
}

function loadFlowMarket() {
  renderFlowChart();
  updateFlowUI();
}

function updateFlowUI() {
  const h = getFlowHoldings();
  const el = id => document.getElementById(id);
  el('flow-price').textContent = FLOW.price.toFixed(4) + ' TC';
  el('flow-holdings').textContent = h.toFixed(4) + ' FLOW';
  el('flow-value').textContent = (h * FLOW.price).toFixed(2) + ' TC';
  el('comp-coins').textContent = userCoins;
  if(el('flow-tc-bal')) el('flow-tc-bal').textContent = userCoins + ' TC';
  updateCoinsDisplay();
}

function buyFlow() {
  const amt = parseFloat(document.getElementById('flow-amount').value);
  if (!amt || amt <= 0) { toast('Enter TC amount', 'error'); return; }
  if (amt > userCoins) { toast('Not enough TC', 'error'); return; }
  const shares = FLOW.buy(amt);
  userCoins -= amt;
  localStorage.setItem('tf_coins', userCoins);
  setFlowHoldings(getFlowHoldings() + shares);
  updateFlowUI();
  renderFlowChart();
  toast(`Bought ${shares.toFixed(4)} FLOW for ${amt} TC`, 'success');
}

function sellFlow() {
  const shares = parseFloat(document.getElementById('flow-amount').value);
  if (!shares || shares <= 0) { toast('Enter FLOW amount', 'error'); return; }
  if (shares > getFlowHoldings()) { toast('Not enough FLOW', 'error'); return; }
  const tc = FLOW.sell(shares);
  userCoins += tc;
  localStorage.setItem('tf_coins', userCoins);
  setFlowHoldings(getFlowHoldings() - shares);
  updateFlowUI();
  renderFlowChart();
  toast(`Sold ${shares.toFixed(4)} FLOW for ${tc.toFixed(2)} TC`, 'success');
}

let flowChart = null;
function renderFlowChart() {
  const ctx = document.getElementById('flow-chart')?.getContext('2d');
  if (!ctx) return;
  const history = FLOW.history.slice(-50);
  if (flowChart) flowChart.destroy();
  const prices = history.map(h => h.p);
  const labels = history.map(h => new Date(h.t).toLocaleTimeString());
  const up = prices.length < 2 || prices[prices.length-1] >= prices[0];
  const color = up ? '#00e09e' : '#ff4757';
  flowChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ data: prices, borderColor: color, borderWidth: 2, fill: true,
      backgroundColor: c => { const g = c.chart.ctx.createLinearGradient(0,0,0,180); g.addColorStop(0, up?'rgba(0,224,158,.15)':'rgba(255,71,87,.15)'); g.addColorStop(1,'rgba(0,0,0,0)'); return g; },
      tension: 0.4, pointRadius: 0 }] },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{x:{display:false},y:{position:'right',grid:{color:'rgba(30,42,61,.4)'},ticks:{font:{size:10},color:'#6b7fa3',callback:v=>v.toFixed(2)+' TC'}}}
    }
  });
}
