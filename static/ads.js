// ═══════════════════════════════════
//  TradeFlow Ad System
// ═══════════════════════════════════
const AD_DURATION = 20;      // seconds per ad
const MAX_ADS_PER_DAY = 60;  // 60 × 20s = 20 min
const TC_PER_AD = 10;        // TradeCoins per ad

function getAdStats() {
  const key = 'tf_ads_' + new Date().toDateString();
  return parseInt(localStorage.getItem(key) || '0');
}

function incrementAdCount() {
  const key = 'tf_ads_' + new Date().toDateString();
  localStorage.setItem(key, getAdStats() + 1);
}

async function detectAdBlocker() {
  return new Promise(resolve => {
    const bait = document.createElement('div');
    bait.className = 'ad-banner pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads';
    bait.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px';
    document.body.appendChild(bait);
    setTimeout(() => {
      const blocked = !bait.offsetHeight || bait.style.display === 'none' || bait.offsetParent === null;
      bait.remove();
      resolve(blocked);
    }, 100);
  });
}

async function showAd() {
  const modal = document.getElementById('ad-modal');
  const msg = document.getElementById('ad-message');
  const bar = document.getElementById('ad-progress-bar');
  const btn = document.getElementById('ad-claim-btn');
  const timer = document.getElementById('ad-timer');

  // Check daily limit
  if (getAdStats() >= MAX_ADS_PER_DAY) {
    showAdMessage('⏰ Daily limit reached (20 min). Come back tomorrow!', 'warning');
    return;
  }

  // Detect ad blocker
  msg.textContent = 'Checking for ad blocker…';
  modal.classList.add('open');
  btn.style.display = 'none';
  bar.style.width = '0%';

  const blocked = await detectAdBlocker();
  if (blocked) {
    msg.innerHTML = `
      <div style="color:var(--red);font-size:15px;font-weight:700;margin-bottom:8px">🚫 Ad Blocker Detected</div>
      <div style="color:var(--txt2);font-size:13px;line-height:1.7">
        TradeCoins are funded by ads. Please disable your ad blocker for this site to earn TC.
        <br><br>
        <strong style="color:var(--txt)">How to disable:</strong><br>
        Click your ad blocker icon → Pause on this site → Refresh
      </div>`;
    document.getElementById('ad-close-btn').style.display = '';
    return;
  }

  // Show fake ad + countdown
  const adsLeft = MAX_ADS_PER_DAY - getAdStats();
  msg.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;margin-bottom:12px">
      <div style="font-size:11px;color:var(--txt3);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Advertisement</div>
      <div style="font-size:28px;margin-bottom:8px">📈</div>
      <div style="font-family:var(--font-head);font-size:16px;font-weight:700;margin-bottom:4px">TradeFlow Pro</div>
      <div style="font-size:12px;color:var(--txt2)">Master the markets with advanced tools</div>
    </div>
    <div style="font-size:12px;color:var(--txt2);text-align:center">${adsLeft} ads remaining today · +${TC_PER_AD} TC per ad</div>`;

  let seconds = AD_DURATION;
  timer.textContent = seconds + 's';
  bar.style.transition = 'none';
  bar.style.width = '0%';

  const interval = setInterval(() => {
    seconds--;
    timer.textContent = seconds + 's';
    bar.style.transition = 'width 1s linear';
    bar.style.width = ((AD_DURATION - seconds) / AD_DURATION * 100) + '%';
    if (seconds <= 0) {
      clearInterval(interval);
      timer.textContent = '✓';
      btn.style.display = '';
      btn.onclick = () => claimTC();
    }
  }, 1000);
}

function claimTC() {
  incrementAdCount();
  userCoins += TC_PER_AD;
  localStorage.setItem('tf_coins', userCoins);
  updateCoinsDisplay();
  closeAdModal();
  showAdMessage(`🪙 +${TC_PER_AD} TradeCoins earned!`, 'success');
}

function closeAdModal() {
  document.getElementById('ad-modal').classList.remove('open');
}

function showAdMessage(msg, type) {
  toast(msg, type);
}
