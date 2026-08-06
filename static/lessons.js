// ═══════════════════════════════════
//  TradeFlow Academy — Lesson Library
//  Text lessons + Video lessons
//  Original content © TradeFlow
// ═══════════════════════════════════

const LESSONS = [
  // ── MODULE 1: BASICS ─────────────────────────────────────────────────────
  {
    id: 'basics-1', module: 'Basics', title: 'What Is the Stock Market?',
    duration: 3, tc: 10, type: 'text',
    content: `
<h3>What Is the Stock Market?</h3>
<p>The stock market is a marketplace where buyers and sellers trade shares of publicly listed companies. When a company wants to raise money, it can sell pieces of ownership — called <strong>shares</strong> or <strong>stocks</strong> — to the public.</p>
<p>If you buy a share of a company, you own a small percentage of that business. If the company grows and becomes more valuable, your share is worth more. If it struggles, your share loses value.</p>
<h4>Key Terms</h4>
<ul>
  <li><strong>Stock/Share:</strong> A unit of ownership in a company</li>
  <li><strong>Exchange:</strong> The platform where stocks are traded (e.g. NYSE, NASDAQ)</li>
  <li><strong>Bull Market:</strong> A market trending upward</li>
  <li><strong>Bear Market:</strong> A market trending downward</li>
  <li><strong>Index:</strong> A basket of stocks used to measure market performance (e.g. S&P 500)</li>
</ul>
<h4>Why Do Stock Prices Move?</h4>
<p>Prices move based on supply and demand. If more people want to buy a stock than sell it, the price goes up. If more people want to sell, the price goes down. News, earnings reports, and economic data all influence this.</p>
<h4>Key Takeaway</h4>
<p>The stock market lets companies raise money and lets investors grow wealth by owning pieces of successful businesses. It's not gambling — it's ownership.</p>`
  },
  {
    id: 'basics-2', module: 'Basics', title: 'How to Read a Stock Quote',
    duration: 3, tc: 10, type: 'text',
    content: `
<h3>How to Read a Stock Quote</h3>
<p>A stock quote gives you a snapshot of a stock's current price and recent performance. Understanding what each field means is essential before placing any trade.</p>
<h4>Parts of a Quote</h4>
<ul>
  <li><strong>Symbol (Ticker):</strong> The short code for a stock — e.g. AAPL for Apple</li>
  <li><strong>Price:</strong> The last price at which the stock traded</li>
  <li><strong>Change:</strong> How much the price has moved today in dollars</li>
  <li><strong>Change %:</strong> The percentage change from yesterday's closing price</li>
  <li><strong>Volume:</strong> Number of shares traded today — high volume = strong interest</li>
  <li><strong>Market Cap:</strong> Total value of the company (price × total shares)</li>
  <li><strong>52W High/Low:</strong> Highest and lowest price over the past year</li>
  <li><strong>P/E Ratio:</strong> Price-to-earnings — how much investors pay per $1 of profit</li>
</ul>
<h4>Key Takeaway</h4>
<p>Always check volume alongside price. A big price move on low volume is less meaningful than the same move on high volume.</p>`
  },
  {
    id: 'basics-3', module: 'Basics', title: 'Types of Orders',
    duration: 3, tc: 10, type: 'text',
    content: `
<h3>Types of Orders</h3>
<p>When you buy or sell a stock, you place an order. There are different order types, each with different risk and control levels.</p>
<h4>Market Order</h4>
<p>Executes immediately at the current market price. You get filled fast but have no control over the exact price.</p>
<h4>Limit Order</h4>
<p>You set a specific price. The order only executes at that price or better. Gives you price control but may not fill.</p>
<h4>Stop-Loss Order</h4>
<p>Triggers a market order when the price reaches a set level. Used to limit losses automatically.</p>
<h4>Key Takeaway</h4>
<p>Use market orders for speed, limit orders for price control, and stop-loss orders to protect against large losses.</p>`
  },
  {
    id: 'basics-4', module: 'Basics', title: 'What Are ETFs?',
    duration: 3, tc: 10, type: 'text',
    content: `
<h3>What Are ETFs?</h3>
<p>An <strong>ETF (Exchange-Traded Fund)</strong> is a basket of stocks bundled into a single tradeable asset. Instead of buying 500 individual stocks, you can buy SPY — which tracks all 500 companies in the S&P 500 index.</p>
<h4>Why ETFs Are Popular</h4>
<ul>
  <li><strong>Diversification:</strong> One purchase = exposure to many companies</li>
  <li><strong>Low cost:</strong> ETFs have lower fees than mutual funds</li>
  <li><strong>Flexibility:</strong> Trade like a stock during market hours</li>
</ul>
<h4>Common ETFs</h4>
<ul>
  <li><strong>SPY:</strong> S&P 500 (top 500 US companies)</li>
  <li><strong>QQQ:</strong> NASDAQ-100 (top 100 tech stocks)</li>
  <li><strong>VTI:</strong> Total US stock market</li>
</ul>
<h4>Key Takeaway</h4>
<p>ETFs are one of the best tools for beginners — instant diversification at low cost.</p>`
  },
  {
    id: 'basics-5', module: 'Basics', title: 'Understanding Market Hours',
    duration: 2, tc: 10, type: 'text',
    content: `
<h3>Understanding Market Hours</h3>
<p>Stock markets don't trade 24/7. Knowing when markets are open is essential for planning your trades.</p>
<h4>US Market Hours (EST)</h4>
<ul>
  <li><strong>Pre-market:</strong> 4:00 AM – 9:30 AM</li>
  <li><strong>Regular hours:</strong> 9:30 AM – 4:00 PM (best time to trade)</li>
  <li><strong>After-hours:</strong> 4:00 PM – 8:00 PM</li>
</ul>
<h4>South African Context</h4>
<p>US markets open at 3:30 PM SAST in summer and 4:30 PM in winter. JSE trades 9:00 AM – 5:00 PM SAST.</p>
<h4>Key Takeaway</h4>
<p>Trade during regular hours for the best prices and liquidity.</p>`
  },

  // ── MODULE 2: VIDEO LESSONS ───────────────────────────────────────────────
  {
    id: 'video-1', module: 'Video Lessons', title: 'Complete Trading Course for Beginners',
    duration: 10, tc: 30, type: 'video',
    videoId: 'El_bbS31msw',
    description: 'A full beginner trading course — no fluff, everything you need to go from zero to confident trader.'
  },
  {
    id: 'video-2', module: 'Video Lessons', title: 'Technical Analysis Full Course',
    duration: 10, tc: 30, type: 'video',
    videoId: 'eynxyoKgpng',
    description: 'Complete technical analysis course covering charts, indicators, and trading strategies.'
  },
  {
    id: 'video-3', module: 'Video Lessons', title: 'Support & Resistance Masterclass',
    duration: 8, tc: 25, type: 'video',
    videoId: 'THGn5Jl3BvM',
    description: 'Learn how to identify and trade support and resistance levels like a professional.'
  },
  {
    id: 'video-4', module: 'Video Lessons', title: 'Moving Averages Explained',
    duration: 8, tc: 25, type: 'video',
    videoId: 'oEEGZdSXnXA',
    description: 'How to use moving averages to identify trends and time your entries and exits.'
  },
  {
    id: 'video-5', module: 'Video Lessons', title: 'RSI & MACD Indicators',
    duration: 8, tc: 25, type: 'video',
    videoId: 'Wv7INVa2-CA',
    description: 'Master the two most popular momentum indicators used by traders worldwide.'
  },
  {
    id: 'video-6', module: 'Video Lessons', title: 'Risk Management for Traders',
    duration: 8, tc: 25, type: 'video',
    videoId: 'HwGPJrV13S8',
    description: 'Position sizing, stop-losses, and the mindset needed to protect your capital.'
  },
  {
    id: 'video-7', module: 'Video Lessons', title: 'Candlestick Patterns Full Course',
    duration: 10, tc: 30, type: 'video',
    videoId: '5RMbDHRJhLU',
    description: 'Learn to read candlestick charts and recognise the most profitable patterns.'
  },
  {
    id: 'video-8', module: 'Video Lessons', title: 'How to Read Earnings Reports',
    duration: 7, tc: 25, type: 'video',
    videoId: 'SaATRnNoHnM',
    description: 'Understand financial statements and earnings reports to make smarter trades.'
  },

  // ── MODULE 3: ANALYSIS ────────────────────────────────────────────────────
  {
    id: 'analysis-1', module: 'Analysis', title: 'Fundamental vs Technical Analysis',
    duration: 4, tc: 15, type: 'text',
    content: `
<h3>Fundamental vs Technical Analysis</h3>
<p>There are two main schools of thought for analysing stocks.</p>
<h4>Fundamental Analysis</h4>
<p>Looks at the underlying business — revenue, profit, debt, and industry position. Goal: find undervalued stocks. Best for long-term investing.</p>
<h4>Technical Analysis</h4>
<p>Looks at price charts and patterns to predict future movement. Best for short-term trading.</p>
<h4>Key Takeaway</h4>
<p>Use fundamentals to pick what to buy, technicals to decide when to buy.</p>`
  },
  {
    id: 'analysis-2', module: 'Analysis', title: 'Support and Resistance',
    duration: 4, tc: 15, type: 'text',
    content: `
<h3>Support and Resistance</h3>
<h4>Support</h4>
<p>A price level where a stock tends to stop falling and bounce back up — a "floor." Buyers step in here.</p>
<h4>Resistance</h4>
<p>A price level where a stock tends to stop rising — a "ceiling." Sellers step in here.</p>
<h4>How to Use Them</h4>
<ul>
  <li>Buy near support, sell near resistance</li>
  <li>Set stop-losses just below support</li>
  <li>Watch for breakouts with high volume</li>
</ul>
<h4>Key Takeaway</h4>
<p>Support and resistance are self-fulfilling — because many traders watch the same levels, those levels become meaningful.</p>`
  },
  {
    id: 'analysis-3', module: 'Analysis', title: 'Moving Averages',
    duration: 4, tc: 15, type: 'text',
    content: `
<h3>Moving Averages</h3>
<p>A moving average smooths out price data to show the underlying trend.</p>
<h4>Common Periods</h4>
<ul>
  <li><strong>20 SMA:</strong> Short-term trend</li>
  <li><strong>50 SMA:</strong> Medium-term (watched by institutions)</li>
  <li><strong>200 SMA:</strong> Long-term (above = bullish, below = bearish)</li>
</ul>
<h4>Golden Cross & Death Cross</h4>
<p><strong>Golden Cross:</strong> 50 SMA crosses above 200 SMA — bullish.<br>
<strong>Death Cross:</strong> 50 SMA crosses below 200 SMA — bearish.</p>
<h4>Key Takeaway</h4>
<p>Moving averages tell you the trend. Trade in the direction of the trend.</p>`
  },
  {
    id: 'analysis-4', module: 'Analysis', title: 'RSI — Relative Strength Index',
    duration: 3, tc: 15, type: 'text',
    content: `
<h3>RSI — Relative Strength Index</h3>
<p>RSI measures momentum. It ranges from 0 to 100.</p>
<ul>
  <li><strong>Above 70:</strong> Overbought — may pull back</li>
  <li><strong>Below 30:</strong> Oversold — may bounce</li>
  <li><strong>50 level:</strong> Above = bullish momentum, below = bearish</li>
</ul>
<h4>Key Takeaway</h4>
<p>Use RSI as confirmation alongside other signals, not as a standalone indicator.</p>`
  },
  {
    id: 'analysis-5', module: 'Analysis', title: 'Reading Earnings Reports',
    duration: 4, tc: 15, type: 'text',
    content: `
<h3>Reading Earnings Reports</h3>
<h4>Key Metrics</h4>
<ul>
  <li><strong>EPS:</strong> Earnings per share — compare to analyst expectations</li>
  <li><strong>Revenue:</strong> Total sales</li>
  <li><strong>Guidance:</strong> What management expects next — often more important than current results</li>
</ul>
<h4>Beat and Miss</h4>
<p>Stocks are priced on expectations. Beat expectations = price rises. Miss = price falls even if the company was profitable.</p>
<h4>Key Takeaway</h4>
<p>Always check when earnings are due before entering a trade. Never hold a speculative position through earnings unprepared.</p>`
  },

  // ── MODULE 4: RISK MANAGEMENT ─────────────────────────────────────────────
  {
    id: 'risk-1', module: 'Risk Management', title: 'Position Sizing',
    duration: 4, tc: 20, type: 'text',
    content: `
<h3>Position Sizing</h3>
<p>Never risk more than 1-2% of your total portfolio on a single trade.</p>
<h4>How to Calculate</h4>
<ol>
  <li>Decide your maximum loss: e.g. $100</li>
  <li>Decide your stop-loss distance: e.g. $5 per share</li>
  <li>Position size = $100 ÷ $5 = 20 shares</li>
</ol>
<h4>Key Takeaway</h4>
<p>Size every position based on your stop-loss distance, not how confident you feel.</p>`
  },
  {
    id: 'risk-2', module: 'Risk Management', title: 'Stop-Losses',
    duration: 3, tc: 20, type: 'text',
    content: `
<h3>Stop-Losses</h3>
<p>A stop-loss is a pre-set order to sell if a stock falls to a certain price.</p>
<h4>Where to Place Them</h4>
<ul>
  <li>Below a key support level</li>
  <li>Below a moving average</li>
  <li>5-8% below entry for swing trades</li>
</ul>
<h4>Hard Stops vs Mental Stops</h4>
<p>Always use hard stop-loss orders. Mental stops fail when emotions kick in.</p>
<h4>Key Takeaway</h4>
<p>Set your stop before you enter. Never move it lower to "give the trade more room."</p>`
  },
  {
    id: 'risk-3', module: 'Risk Management', title: 'Diversification',
    duration: 3, tc: 20, type: 'text',
    content: `
<h3>Diversification</h3>
<p>Spread money across different investments so no single loss can seriously damage your portfolio.</p>
<h4>How to Diversify</h4>
<ul>
  <li>Across sectors: Tech, healthcare, finance, energy</li>
  <li>Across market caps: Large, mid, small cap</li>
  <li>Across asset classes: Stocks, ETFs, cash</li>
</ul>
<h4>Key Takeaway</h4>
<p>Diversify enough to survive any single stock blowing up — but not so much that winners don't move your portfolio.</p>`
  },
  {
    id: 'risk-4', module: 'Risk Management', title: 'Trading Psychology',
    duration: 5, tc: 25, type: 'text',
    content: `
<h3>The Psychology of Trading</h3>
<p>Most traders don't fail because of bad analysis — they fail because of bad psychology.</p>
<h4>Fear and Greed</h4>
<p><strong>Fear</strong> makes you sell too early. <strong>Greed</strong> makes you hold too long.</p>
<h4>FOMO</h4>
<p>Seeing a stock up 20% and jumping in because you "missed it" — you end up buying the top.</p>
<h4>Revenge Trading</h4>
<p>After a loss, jumping into a new trade immediately to "make it back." Take a break after losses.</p>
<h4>Key Takeaway</h4>
<p>Your worst trades will always be the emotional ones. Follow your plan consistently.</p>`
  },
  {
    id: 'risk-5', module: 'Risk Management', title: 'Building a Trading Plan',
    duration: 5, tc: 25, type: 'text',
    content: `
<h3>Building a Trading Plan</h3>
<p>A trading plan defines exactly what you will and won't do in the market.</p>
<h4>What to Include</h4>
<ol>
  <li>What will you trade?</li>
  <li>What setups will you look for?</li>
  <li>How long will you hold?</li>
  <li>Where is your stop-loss and profit target?</li>
  <li>How much will you risk per trade?</li>
  <li>What is your max daily loss before you stop?</li>
</ol>
<h4>Key Takeaway</h4>
<p>Write it down. Review before every session. If a trade doesn't meet your criteria — skip it.</p>`
  },
];

// ═══════════════════════════════════
//  LESSON PROGRESS
// ═══════════════════════════════════
function getCompletedLessons() {
  return JSON.parse(localStorage.getItem('tf_completed_lessons') || '[]');
}

function markLessonComplete(id) {
  const completed = getCompletedLessons();
  if (!completed.includes(id)) {
    completed.push(id);
    localStorage.setItem('tf_completed_lessons', JSON.stringify(completed));
  }
}

function isLessonCompleted(id) {
  return getCompletedLessons().includes(id);
}

function getTotalTC() {
  return LESSONS.reduce((sum, l) => sum + l.tc, 0);
}

// ═══════════════════════════════════
//  LESSON UI
// ═══════════════════════════════════
const MODULES = ['Basics', 'Video Lessons', 'Analysis', 'Risk Management'];

function loadAcademy() {
  const completed = getCompletedLessons();
  const totalLessons = LESSONS.length;
  const completedCount = completed.length;
  const earned = LESSONS.filter(l => completed.includes(l.id)).reduce((s,l) => s+l.tc, 0);
  const total = getTotalTC();

  document.getElementById('academy-progress-text').textContent = `${completedCount}/${totalLessons} lessons · ${earned}/${total} TC earned`;
  document.getElementById('academy-progress-bar').style.width = (completedCount / totalLessons * 100) + '%';
  if (document.getElementById('comp-coins-academy')) document.getElementById('comp-coins-academy').textContent = userCoins;

  const container = document.getElementById('academy-modules');
  container.innerHTML = MODULES.map(mod => {
    const lessons = LESSONS.filter(l => l.module === mod);
    const modCompleted = lessons.filter(l => completed.includes(l.id)).length;
    return `
      <div class="academy-module">
        <div class="academy-mod-header">
          <div>
            <div class="academy-mod-title">${mod === 'Video Lessons' ? '🎬 ' : '📖 '}${mod}</div>
            <div class="academy-mod-sub">${modCompleted}/${lessons.length} completed</div>
          </div>
          <div class="academy-mod-tc">+${lessons.reduce((s,l)=>s+l.tc,0)} TC</div>
        </div>
        ${lessons.map(l => `
          <div class="academy-lesson ${completed.includes(l.id) ? 'completed' : ''}">
            <div class="lesson-icon">${completed.includes(l.id) ? '✅' : l.type === 'video' ? '🎬' : '📖'}</div>
            <div class="lesson-info">
              <div class="lesson-title">${l.title}</div>
              <div class="lesson-meta">${l.duration} min ${l.type === 'video' ? 'video' : 'read'} · +${l.tc} TC</div>
            </div>
            <button class="lesson-btn ${completed.includes(l.id) ? 'done' : ''}" data-open="${l.id}">
              ${completed.includes(l.id) ? 'Review' : l.type === 'video' ? 'Watch →' : 'Start →'}
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => openLesson(btn.dataset.open));
  });
}

function openLesson(id) {
  const lesson = LESSONS.find(l => l.id === id);
  if (!lesson) return;
  const already = isLessonCompleted(id);

  document.getElementById('lesson-modal-title').textContent = lesson.title;
  document.getElementById('lesson-modal-meta').textContent = `${lesson.module} · ${lesson.duration} min ${lesson.type === 'video' ? 'video' : 'read'}`;

  const body = document.getElementById('lesson-modal-body');
  if (lesson.type === 'video') {
    body.innerHTML = `
      <div style="margin-bottom:14px;font-size:13px;color:var(--txt2);line-height:1.7">${lesson.description}</div>
      <div style="position:relative;padding-bottom:56.25%;height:0;border-radius:10px;overflow:hidden;background:#000">
        <iframe src="https://www.youtube-nocookie.com/embed/${lesson.videoId}?rel=0&modestbranding=1"
          style="position:absolute;top:0;left:0;width:100%;height:100%;border:none"
          allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
        </iframe>
      </div>
      <div style="margin-top:14px;font-size:12px;color:var(--txt3)">Watch the full video then click Complete to earn your TC.</div>`;
  } else {
    body.innerHTML = lesson.content;
  }

  const btn = document.getElementById('lesson-complete-btn');
  if (already) {
    btn.textContent = '✅ Already completed';
    btn.disabled = true;
    btn.style.background = 'var(--card2)';
    btn.style.color = 'var(--txt2)';
    btn.onclick = null;
  } else if (lesson.type === 'video') {
    // Lock button for video duration
    const waitSecs = lesson.duration * 60;
    btn.disabled = true;
    btn.style.background = 'var(--border)';
    btn.style.color = 'var(--txt2)';
    btn.onclick = null;
    btn.textContent = `▶ Press play on the video to start timer`;

    // Listen for iframe interaction (user clicks play)
    const iframe = document.querySelector('#lesson-modal-body iframe');
    let timerStarted = false;

    function startVideoTimer() {
      if (timerStarted) return;
      timerStarted = true;
      let remaining = waitSecs;
      btn.textContent = `${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')} remaining — keep watching`;
      const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(interval);
          btn.disabled = false;
          btn.style.background = 'var(--green)';
          btn.style.color = '#000';
          btn.textContent = `Complete & Earn +${lesson.tc} TC 🪙`;
          btn.onclick = () => completeLesson(id, lesson.tc);
        } else {
          btn.textContent = `${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')} remaining — keep watching`;
        }
      }, 1000);
    }

    // Start timer when user clicks on the iframe (plays video)
    window.addEventListener('blur', function onBlur() {
      if (document.activeElement === iframe) {
        startVideoTimer();
        window.removeEventListener('blur', onBlur);
      }
    });
  } else {
    btn.textContent = `Complete & Earn +${lesson.tc} TC 🪙`;
    btn.disabled = false;
    btn.style.background = 'var(--green)';
    btn.style.color = '#000';
    btn.onclick = () => completeLesson(id, lesson.tc);
  }

  document.getElementById('lesson-modal').classList.add('open');
}

async function completeLesson(id, tc) {
  markLessonComplete(id);
  try {
    const result = await api(`/api/flow/award?amount=${tc}`, { method: 'POST' });
    userCoins = result.tc_balance;
    localStorage.setItem('tf_coins', userCoins);
  } catch(e) {
    // Fallback to localStorage if backend fails
    userCoins += tc;
    localStorage.setItem('tf_coins', userCoins);
  }
  updateCoinsDisplay();
  document.getElementById('lesson-modal').classList.remove('open');
  loadAcademy();
  toast(`+${tc} TC earned! 🪙`, 'success');
}
