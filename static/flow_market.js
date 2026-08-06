// ═══════════════════════════════════
//  FLOW Market Engine — Backend powered
//  All prices shared globally via Supabase
// ═══════════════════════════════════

let flowPrice = 100;
let flowShares = 0;
let flowTCBalance = 0;
let flowChart = null;

async function loadFlowMarket() {
  try {
    const [priceData, position] = await Promise.all([
      api('/api/flow/price'),
      api('/api/flow/position')
    ]);
    flowPrice = priceData.price;
    flowShares = position.shares;
    flowTCBalance = position.tc_balance;
    userCoins = position.tc_balance;
    localStorage.setItem('tf_coins', userCoins);
    updateFlowUI();
    renderFlowChart(priceData.history || []);
  } catch(e) {
    console.error('Flow market load error:', e);
  }
}

function updateFlowUI() {
  const el = id => document.getElementById(id);
  if (el('flow-price')) el('flow-price').textContent = parseFloat(flowPrice).toFixed(4) + ' TC';
  if (el('flow-holdings')) el('flow-holdings').textContent = parseFloat(flowShares).toFixed(4) + ' FLOW';
  if (el('flow-value')) el('flow-value').textContent = (flowShares * flowPrice).toFixed(2) + ' TC';
  if (el('flow-tc-bal')) el('flow-tc-bal').textContent = parseFloat(flowTCBalance).toFixed(2) + ' TC';
  if (el('comp-coins')) el('comp-coins').textContent = Math.floor(flowTCBalance);
  updateCoinsDisplay();
}

async function buyFlow() {
  const amt = parseFloat(document.getElementById('flow-amount').value);
  if (!amt || amt <= 0) { toast('Enter TC amount', 'error'); return; }
  try {
    const result = await api('/api/flow/buy', {
      method: 'POST',
      body: JSON.stringify({ amount: amt })
    });
    toast(`Bought ${result.shares_bought.toFixed(4)} FLOW for ${amt} TC`, 'success');
    await loadFlowMarket();
    document.getElementById('flow-amount').value = '';
  } catch(e) { toast(e.message, 'error'); }
}

async function sellFlow() {
  const shares = parseFloat(document.getElementById('flow-amount').value);
  if (!shares || shares <= 0) { toast('Enter FLOW amount', 'error'); return; }
  try {
    const result = await api('/api/flow/sell', {
      method: 'POST',
      body: JSON.stringify({ amount: shares })
    });
    toast(`Sold ${shares.toFixed(4)} FLOW for ${result.tc_received.toFixed(2)} TC`, 'success');
    await loadFlowMarket();
    document.getElementById('flow-amount').value = '';
  } catch(e) { toast(e.message, 'error'); }
}

function renderFlowChart(history) {
  const ctx = document.getElementById('flow-chart')?.getContext('2d');
  if (!ctx) return;
  if (flowChart) flowChart.destroy();
  const prices = history.map(h => h.price);
  const labels = history.map(h => new Date(h.t).toLocaleTimeString());
  if (!prices.length) { prices.push(flowPrice); labels.push('Now'); }
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
