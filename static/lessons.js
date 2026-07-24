// ═══════════════════════════════════
//  TradeFlow Academy — Lesson Library
//  Original content © TradeFlow
// ═══════════════════════════════════

const LESSONS = [
  // ── MODULE 1: BASICS ─────────────────────────────────────────────────────
  {
    id: 'basics-1',
    module: 'Basics',
    title: 'What Is the Stock Market?',
    duration: 3,
    tc: 10,
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
<p>The stock market lets companies raise money and lets investors grow wealth by owning pieces of successful businesses. It's not gambling — it's ownership.</p>
    `
  },
  {
    id: 'basics-2',
    module: 'Basics',
    title: 'How to Read a Stock Quote',
    duration: 3,
    tc: 10,
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
<h4>Example</h4>
<p>AAPL at $195.40, +2.10 (+1.09%), Volume 58M means Apple's stock is up $2.10 today, trading at $195.40, with 58 million shares changing hands.</p>
<h4>Key Takeaway</h4>
<p>Always check volume alongside price. A big price move on low volume is less meaningful than the same move on high volume.</p>
    `
  },
  {
    id: 'basics-3',
    module: 'Basics',
    title: 'Types of Orders',
    duration: 3,
    tc: 10,
    content: `
<h3>Types of Orders</h3>
<p>When you buy or sell a stock, you place an order. There are different order types, each with different risk and control levels.</p>
<h4>Market Order</h4>
<p>Executes immediately at the current market price. You get filled fast but have no control over the exact price. Best for liquid stocks where price differences are small.</p>
<h4>Limit Order</h4>
<p>You set a specific price. The order only executes at that price or better. A buy limit order fills at or below your price. A sell limit fills at or above. Gives you price control but may not fill if the price never reaches your level.</p>
<h4>Stop Order (Stop-Loss)</h4>
<p>Triggers a market order when the price reaches a set level. Used to limit losses — e.g. if you buy at $100, set a stop at $90 to automatically sell if it drops that far.</p>
<h4>Stop-Limit Order</h4>
<p>Combines stop and limit. When the stop price is hit, a limit order is placed instead of a market order. More control, but risk of not filling during fast moves.</p>
<h4>Key Takeaway</h4>
<p>Use market orders for speed, limit orders for price control, and stop-loss orders to protect against large losses.</p>
    `
  },
  {
    id: 'basics-4',
    module: 'Basics',
    title: 'What Are ETFs?',
    duration: 3,
    tc: 10,
    content: `
<h3>What Are ETFs?</h3>
<p>An <strong>ETF (Exchange-Traded Fund)</strong> is a basket of stocks bundled into a single tradeable asset. Instead of buying 500 individual stocks, you can buy SPY — which tracks all 500 companies in the S&P 500 index.</p>
<h4>Why ETFs Are Popular</h4>
<ul>
  <li><strong>Diversification:</strong> One purchase = exposure to many companies</li>
  <li><strong>Low cost:</strong> ETFs have lower fees than mutual funds</li>
  <li><strong>Flexibility:</strong> Trade like a stock — buy/sell anytime during market hours</li>
  <li><strong>Transparency:</strong> Holdings are disclosed daily</li>
</ul>
<h4>Common ETFs</h4>
<ul>
  <li><strong>SPY:</strong> Tracks the S&P 500 (top 500 US companies)</li>
  <li><strong>QQQ:</strong> Tracks the NASDAQ-100 (top 100 tech stocks)</li>
  <li><strong>VTI:</strong> Total US stock market</li>
  <li><strong>GLD:</strong> Gold price ETF</li>
</ul>
<h4>Key Takeaway</h4>
<p>ETFs are one of the best tools for beginners — instant diversification at low cost. Many professional investors use them as their primary investment.</p>
    `
  },
  {
    id: 'basics-5',
    module: 'Basics',
    title: 'Understanding Market Hours',
    duration: 2,
    tc: 10,
    content: `
<h3>Understanding Market Hours</h3>
<p>Stock markets don't trade 24/7. Knowing when markets are open is essential for planning your trades.</p>
<h4>US Market Hours (EST)</h4>
<ul>
  <li><strong>Pre-market:</strong> 4:00 AM – 9:30 AM (lower volume, wider spreads)</li>
  <li><strong>Regular hours:</strong> 9:30 AM – 4:00 PM (highest volume and liquidity)</li>
  <li><strong>After-hours:</strong> 4:00 PM – 8:00 PM (earnings often released here)</li>
</ul>
<h4>Why Hours Matter</h4>
<p>The first 30 minutes (9:30–10:00 AM) and last 30 minutes (3:30–4:00 PM) tend to have the most volatility and volume. Many traders avoid trading right at open due to wild price swings.</p>
<h4>South African Context</h4>
<p>US markets open at 3:30 PM SAST in summer and 4:30 PM in winter. JSE (Johannesburg Stock Exchange) trades 9:00 AM – 5:00 PM SAST.</p>
<h4>Key Takeaway</h4>
<p>Trade during regular hours for the best prices and liquidity. Avoid pre-market unless you're experienced with the risks.</p>
    `
  },

  // ── MODULE 2: ANALYSIS ────────────────────────────────────────────────────
  {
    id: 'analysis-1',
    module: 'Analysis',
    title: 'Fundamental vs Technical Analysis',
    duration: 4,
    tc: 15,
    content: `
<h3>Fundamental vs Technical Analysis</h3>
<p>There are two main schools of thought for analysing stocks. Most successful traders use a combination of both.</p>
<h4>Fundamental Analysis</h4>
<p>Looks at the underlying business — revenue, profit, debt, management, and industry position. The goal is to determine if a stock is <strong>undervalued</strong> (worth more than its price) or <strong>overvalued</strong>.</p>
<p>Key metrics: P/E ratio, EPS (earnings per share), revenue growth, debt-to-equity, free cash flow.</p>
<p><em>Best for:</em> Long-term investing (months to years)</p>
<h4>Technical Analysis</h4>
<p>Looks at price charts and patterns to predict future price movement. It assumes all known information is already reflected in the price, and history tends to repeat.</p>
<p>Key tools: Moving averages, RSI, MACD, support/resistance levels, volume.</p>
<p><em>Best for:</em> Short-term trading (days to weeks)</p>
<h4>Which Is Better?</h4>
<p>Neither is universally better. Warren Buffett uses pure fundamentals. Day traders use pure technicals. Most swing traders combine both — find fundamentally strong stocks, then use technicals to time entry.</p>
<h4>Key Takeaway</h4>
<p>Understand both. Use fundamentals to pick what to buy, technicals to decide when to buy.</p>
    `
  },
  {
    id: 'analysis-2',
    module: 'Analysis',
    title: 'Support and Resistance',
    duration: 4,
    tc: 15,
    content: `
<h3>Support and Resistance</h3>
<p>Support and resistance are the foundation of technical analysis. They describe price levels where a stock repeatedly bounces or stalls.</p>
<h4>Support</h4>
<p>A price level where a stock tends to stop falling and bounce back up. Think of it as a "floor." Buyers step in at this level because they consider it a good price.</p>
<h4>Resistance</h4>
<p>A price level where a stock tends to stop rising and pull back. Think of it as a "ceiling." Sellers step in because they think the stock is overpriced at this level.</p>
<h4>Breakouts</h4>
<p>When a stock breaks through resistance with strong volume, it often continues higher — this is called a breakout. The old resistance level typically becomes new support. Similarly, when support breaks, it often becomes resistance.</p>
<h4>How to Use Them</h4>
<ul>
  <li>Buy near support, sell near resistance</li>
  <li>Set stop-losses just below support</li>
  <li>Watch for breakouts as entry points</li>
  <li>Higher volume on breakouts = more reliable</li>
</ul>
<h4>Key Takeaway</h4>
<p>Support and resistance are self-fulfilling — because many traders watch the same levels, those levels become meaningful.</p>
    `
  },
  {
    id: 'analysis-3',
    module: 'Analysis',
    title: 'Moving Averages Explained',
    duration: 4,
    tc: 15,
    content: `
<h3>Moving Averages Explained</h3>
<p>A moving average (MA) smooths out price data to show the underlying trend, filtering out day-to-day noise.</p>
<h4>Simple Moving Average (SMA)</h4>
<p>The average closing price over N days. A 50-day SMA adds the last 50 closing prices and divides by 50. It updates daily as new prices come in.</p>
<h4>Exponential Moving Average (EMA)</h4>
<p>Like the SMA but gives more weight to recent prices. Reacts faster to new information. Traders often prefer EMA for short-term trading.</p>
<h4>Common Periods</h4>
<ul>
  <li><strong>9 EMA:</strong> Very short-term, used by day traders</li>
  <li><strong>20 SMA:</strong> Short-term trend</li>
  <li><strong>50 SMA:</strong> Medium-term trend (key level watched by institutions)</li>
  <li><strong>200 SMA:</strong> Long-term trend (stock above = bullish, below = bearish)</li>
</ul>
<h4>Golden Cross & Death Cross</h4>
<p><strong>Golden Cross:</strong> 50 SMA crosses above 200 SMA — bullish signal, often triggers a rally.<br>
<strong>Death Cross:</strong> 50 SMA crosses below 200 SMA — bearish signal, often precedes a decline.</p>
<h4>Key Takeaway</h4>
<p>Moving averages tell you the trend direction. Trade in the direction of the trend — don't fight the tape.</p>
    `
  },
  {
    id: 'analysis-4',
    module: 'Analysis',
    title: 'RSI — Relative Strength Index',
    duration: 3,
    tc: 15,
    content: `
<h3>RSI — Relative Strength Index</h3>
<p>RSI is a momentum indicator that measures how fast and how much a stock's price has moved. It ranges from 0 to 100.</p>
<h4>How to Read RSI</h4>
<ul>
  <li><strong>Above 70:</strong> Overbought — stock may be due for a pullback</li>
  <li><strong>Below 30:</strong> Oversold — stock may be due for a bounce</li>
  <li><strong>50 level:</strong> Midpoint — above 50 = bullish momentum, below = bearish</li>
</ul>
<h4>RSI Divergence</h4>
<p>One of the most powerful RSI signals:</p>
<ul>
  <li><strong>Bullish divergence:</strong> Price makes a new low but RSI makes a higher low — reversal incoming</li>
  <li><strong>Bearish divergence:</strong> Price makes a new high but RSI makes a lower high — weakness incoming</li>
</ul>
<h4>Common Mistakes</h4>
<p>Don't just sell because RSI is above 70. In strong uptrends, RSI can stay overbought for weeks. Use RSI as confirmation, not as a standalone signal.</p>
<h4>Key Takeaway</h4>
<p>RSI helps you avoid buying at the top and selling at the bottom. Combine it with support/resistance for stronger signals.</p>
    `
  },
  {
    id: 'analysis-5',
    module: 'Analysis',
    title: 'Reading Earnings Reports',
    duration: 4,
    tc: 15,
    content: `
<h3>Reading Earnings Reports</h3>
<p>Every public company reports its financial results quarterly. Earnings reports are the single most impactful event for a stock's price.</p>
<h4>Key Metrics to Watch</h4>
<ul>
  <li><strong>EPS (Earnings Per Share):</strong> Profit divided by shares outstanding. Compare to analyst expectations.</li>
  <li><strong>Revenue:</strong> Total sales. Beat = good, miss = bad.</li>
  <li><strong>Guidance:</strong> What management expects for next quarter. Often more important than the current results.</li>
  <li><strong>Gross Margin:</strong> Revenue minus cost of goods. Higher = more efficient.</li>
  <li><strong>Operating Income:</strong> Profit from core business operations.</li>
</ul>
<h4>Beat and Miss</h4>
<p>Stocks are priced on expectations. If a company earns $1.00 per share but analysts expected $0.80, that's a beat — price usually rises. If they expected $1.20, it's a miss — price usually falls even if the company was profitable.</p>
<h4>Buy the Rumour, Sell the News</h4>
<p>Stocks often rise ahead of expected good earnings, then drop after the announcement even if results are positive. This is because buyers already priced in the good news.</p>
<h4>Key Takeaway</h4>
<p>Always check when a company reports earnings before entering a trade. Never hold a speculative position through earnings unless you understand the risk.</p>
    `
  },

  // ── MODULE 3: STRATEGY ────────────────────────────────────────────────────
  {
    id: 'strategy-1',
    module: 'Strategy',
    title: 'Momentum Trading',
    duration: 4,
    tc: 20,
    content: `
<h3>Momentum Trading</h3>
<p>Momentum trading is based on the idea that stocks moving strongly in one direction tend to continue moving that way — at least for a while.</p>
<h4>The Core Idea</h4>
<p>"The trend is your friend." Momentum traders don't try to predict reversals. They find stocks already moving strongly and ride the wave until signs of weakness appear.</p>
<h4>What to Look For</h4>
<ul>
  <li>Stock up 5%+ on the day with high volume</li>
  <li>Breaking out above a key resistance level</li>
  <li>Strong sector — other stocks in the same industry also moving</li>
  <li>News catalyst — earnings beat, new product, partnership</li>
</ul>
<h4>Entry and Exit</h4>
<p>Enter on a pullback after the initial move or on the breakout itself. Exit when momentum slows — volume drops, price stalls at resistance, or the stock makes a lower high.</p>
<h4>Risk</h4>
<p>Momentum can reverse violently. Always use a stop-loss. Stocks that go up fast can come down even faster.</p>
<h4>Key Takeaway</h4>
<p>Don't fight momentum. If a stock is moving strongly with good volume and a catalyst, the path of least resistance is often to go with it.</p>
    `
  },
  {
    id: 'strategy-2',
    module: 'Strategy',
    title: 'Mean Reversion',
    duration: 4,
    tc: 20,
    content: `
<h3>Mean Reversion</h3>
<p>Mean reversion is the opposite of momentum trading. It's based on the idea that stocks that move far from their average price tend to snap back.</p>
<h4>The Core Idea</h4>
<p>Every stock has a "fair value" range. When it moves too far above or below that range, it eventually returns. Mean reversion traders buy oversold stocks and sell overbought ones.</p>
<h4>Tools for Mean Reversion</h4>
<ul>
  <li><strong>Bollinger Bands:</strong> When price touches the lower band, it's statistically stretched and may bounce</li>
  <li><strong>RSI below 30:</strong> Oversold condition</li>
  <li><strong>Distance from 200 SMA:</strong> Stocks far below their 200 SMA often snap back</li>
</ul>
<h4>When It Works</h4>
<p>Best in ranging, sideways markets. Fails in strong trending markets where stocks can stay overbought/oversold for extended periods.</p>
<h4>Risk</h4>
<p>The biggest risk: a stock is cheap for a reason. Always check fundamentals — a stock down 40% might be heading to zero, not rebounding.</p>
<h4>Key Takeaway</h4>
<p>Mean reversion works — but only when the underlying company is fundamentally sound. Never catch a falling knife without checking why it's falling.</p>
    `
  },
  {
    id: 'strategy-3',
    module: 'Strategy',
    title: 'Swing Trading Basics',
    duration: 4,
    tc: 20,
    content: `
<h3>Swing Trading Basics</h3>
<p>Swing trading involves holding stocks for a few days to a few weeks, capturing short-to-medium term price "swings."</p>
<h4>Why Swing Trade?</h4>
<p>Day trading requires being glued to a screen all day. Long-term investing requires patience measured in years. Swing trading is the middle ground — manageable for people with jobs or school, while still being active.</p>
<h4>The Swing Trading Process</h4>
<ol>
  <li><strong>Scan:</strong> Find stocks making new highs, breaking out, or bouncing from support</li>
  <li><strong>Analyse:</strong> Check the chart for clean pattern, volume confirmation, trend direction</li>
  <li><strong>Plan the trade:</strong> Set entry, target, and stop-loss before entering</li>
  <li><strong>Enter:</strong> Buy at the planned level</li>
  <li><strong>Manage:</strong> Move stop-loss up as price rises (trailing stop)</li>
  <li><strong>Exit:</strong> At target or when trend breaks</li>
</ol>
<h4>Risk/Reward</h4>
<p>Always target at least 2:1 risk/reward. If you risk $100 (stop-loss), your target should be $200 profit minimum. This way you can be wrong half the time and still make money.</p>
<h4>Key Takeaway</h4>
<p>Plan every trade before you enter. Know exactly where you're wrong (stop) and where you're right (target) before risking a cent.</p>
    `
  },
  {
    id: 'strategy-4',
    module: 'Strategy',
    title: 'Dollar Cost Averaging',
    duration: 3,
    tc: 20,
    content: `
<h3>Dollar Cost Averaging (DCA)</h3>
<p>Dollar cost averaging is an investment strategy where you invest a fixed amount at regular intervals, regardless of the price.</p>
<h4>How It Works</h4>
<p>Instead of trying to time the market, you invest $100 every month. When the price is high, you buy fewer shares. When it's low, you buy more. Over time, your average cost per share smooths out.</p>
<h4>Example</h4>
<p>Month 1: Price $50 → buy 2 shares<br>
Month 2: Price $25 → buy 4 shares<br>
Month 3: Price $100 → buy 1 share<br>
Average price: $41.67 per share, while current price is $100. Profit!</p>
<h4>Why It Works</h4>
<p>It removes emotion from investing. You don't panic sell during crashes — you actually buy more. You don't over-invest at tops — you only put in your fixed amount.</p>
<h4>Best For</h4>
<p>Long-term investors in ETFs or fundamentally strong companies. Warren Buffett recommends DCA into an S&P 500 index fund for most people.</p>
<h4>Key Takeaway</h4>
<p>You don't need to time the market. Time IN the market beats timing the market. DCA lets you invest consistently without stress.</p>
    `
  },
  {
    id: 'strategy-5',
    module: 'Strategy',
    title: 'Short Selling',
    duration: 4,
    tc: 20,
    content: `
<h3>Short Selling</h3>
<p>Short selling lets you profit when a stock goes down — the opposite of normal investing.</p>
<h4>How It Works</h4>
<ol>
  <li>You borrow shares from your broker</li>
  <li>You sell them immediately at the current price</li>
  <li>Later, you buy shares back at a lower price</li>
  <li>Return the shares to the broker and keep the difference</li>
</ol>
<p>Example: Borrow and sell 10 shares at $100 = $1,000. Price drops to $70. Buy back for $700. Profit: $300.</p>
<h4>The Risk</h4>
<p>When you buy a stock, the maximum loss is 100% (it goes to zero). When you short, losses are theoretically unlimited — the price can rise forever. A stock you shorted at $100 could go to $500, losing you 400%.</p>
<h4>Short Squeeze</h4>
<p>When many traders are short a stock and it starts rising, they all rush to buy back at once to limit losses. This drives the price up even faster — a short squeeze. GameStop in 2021 is the famous example.</p>
<h4>Key Takeaway</h4>
<p>Short selling is advanced and risky. Never short a stock with high short interest — you may get caught in a squeeze. Always use strict stop-losses.</p>
    `
  },

  // ── MODULE 4: RISK MANAGEMENT ─────────────────────────────────────────────
  {
    id: 'risk-1',
    module: 'Risk Management',
    title: 'Position Sizing',
    duration: 4,
    tc: 20,
    content: `
<h3>Position Sizing</h3>
<p>Position sizing is deciding how much of your portfolio to put into a single trade. It's one of the most important — and most ignored — skills in trading.</p>
<h4>The 1% Rule</h4>
<p>Never risk more than 1-2% of your total portfolio on a single trade. If your portfolio is $10,000, your maximum loss per trade should be $100-$200. This means you can lose 50 trades in a row before your account is seriously damaged.</p>
<h4>How to Calculate Position Size</h4>
<ol>
  <li>Decide your maximum loss: e.g. $100</li>
  <li>Decide your stop-loss distance: e.g. $5 per share</li>
  <li>Position size = Max loss ÷ Stop distance = $100 ÷ $5 = 20 shares</li>
</ol>
<h4>Why Most Traders Fail</h4>
<p>Most losing traders size positions based on how confident they feel. When they're very confident, they go big — and that's exactly when they take their biggest losses.</p>
<h4>Key Takeaway</h4>
<p>Size every position based on your stop-loss distance, not on how confident you feel. Consistency in position sizing is what separates professionals from amateurs.</p>
    `
  },
  {
    id: 'risk-2',
    module: 'Risk Management',
    title: 'Stop-Losses and When to Use Them',
    duration: 3,
    tc: 20,
    content: `
<h3>Stop-Losses and When to Use Them</h3>
<p>A stop-loss is a pre-set order to sell if a stock falls to a certain price. It's your safety net against catastrophic losses.</p>
<h4>Why You Need Them</h4>
<p>Every trader has losing trades. The difference between surviving and blowing up your account is how big those losses are. A stop-loss keeps small mistakes from becoming account-ending disasters.</p>
<h4>Where to Place Stop-Losses</h4>
<ul>
  <li><strong>Below support:</strong> If the stock breaks support, your thesis is wrong — exit</li>
  <li><strong>Below a moving average:</strong> e.g. below the 50 SMA for a swing trade</li>
  <li><strong>Fixed percentage:</strong> e.g. 5-8% below entry for swing trades</li>
  <li><strong>ATR-based:</strong> 1-2x Average True Range below entry</li>
</ul>
<h4>Mental Stop-Losses vs Hard Stops</h4>
<p>Always use hard stop-loss orders, not mental ones. When the price hits your mental stop, emotions kick in and you convince yourself to hold "just a little longer." Hard stops remove that temptation.</p>
<h4>Key Takeaway</h4>
<p>Set your stop-loss before you enter the trade. Once set, don't move it lower to "give the trade more room." Moving stops down is how small losses become big ones.</p>
    `
  },
  {
    id: 'risk-3',
    module: 'Risk Management',
    title: 'Diversification',
    duration: 3,
    tc: 20,
    content: `
<h3>Diversification</h3>
<p>Diversification means spreading your money across different investments so that no single loss can significantly damage your portfolio.</p>
<h4>Why Diversify?</h4>
<p>If you put 100% of your money into one stock and it drops 50%, your portfolio is down 50%. If it's 10% of your portfolio, you're only down 5%. Diversification limits the damage of any single bad decision.</p>
<h4>How to Diversify</h4>
<ul>
  <li><strong>Across sectors:</strong> Tech, healthcare, finance, energy, consumer</li>
  <li><strong>Across market caps:</strong> Large cap, mid cap, small cap</li>
  <li><strong>Across geographies:</strong> US, emerging markets, Europe</li>
  <li><strong>Across asset classes:</strong> Stocks, bonds, ETFs, cash</li>
</ul>
<h4>Over-Diversification</h4>
<p>Owning 100 stocks doesn't make you safer — it makes you the market. If you can't track your positions, you hold too many. Most professionals hold 10-20 high-conviction positions.</p>
<h4>Key Takeaway</h4>
<p>Diversify enough to survive any single stock blowing up. But don't diversify so much that good performance in one stock doesn't move your portfolio.</p>
    `
  },
  {
    id: 'risk-4',
    module: 'Risk Management',
    title: 'The Psychology of Trading',
    duration: 5,
    tc: 25,
    content: `
<h3>The Psychology of Trading</h3>
<p>Most traders don't fail because of bad analysis — they fail because of bad psychology. Emotions are the biggest enemy in trading.</p>
<h4>Fear and Greed</h4>
<p><strong>Fear</strong> makes you sell too early, taking tiny profits while missing big moves. It makes you hesitate on good setups. It makes you exit during normal pullbacks.<br><br>
<strong>Greed</strong> makes you hold too long, turning winners into losers. It makes you overtrade, chasing every move. It makes you risk too much on high-conviction trades.</p>
<h4>FOMO (Fear of Missing Out)</h4>
<p>Seeing a stock up 20% and jumping in because you "missed it" is one of the most common mistakes. You end up buying the top, right before the reversal. If you missed it, let it go — another opportunity will come.</p>
<h4>Revenge Trading</h4>
<p>After a loss, jumping into a new trade immediately to "make it back" is revenge trading. You're emotional, not analytical. Take a break after losses.</p>
<h4>The Solution</h4>
<p>Have a written trading plan. If a trade doesn't meet your criteria, don't take it. Journal every trade — why you entered, what happened, what you learned. Treat trading like a business, not a casino.</p>
<h4>Key Takeaway</h4>
<p>Your worst trades will always be the emotional ones. The discipline to follow your plan consistently is worth more than any indicator or strategy.</p>
    `
  },
  {
    id: 'risk-5',
    module: 'Risk Management',
    title: 'Building a Trading Plan',
    duration: 5,
    tc: 25,
    content: `
<h3>Building a Trading Plan</h3>
<p>A trading plan is your rulebook. It defines exactly what you will and won't do in the market. Without one, you're gambling.</p>
<h4>What a Trading Plan Includes</h4>
<ol>
  <li><strong>Markets:</strong> What will you trade? (US stocks, ETFs, specific sectors)</li>
  <li><strong>Strategy:</strong> What setups will you look for? (Breakouts, reversals, momentum)</li>
  <li><strong>Timeframe:</strong> How long will you hold? (Intraday, swing, position)</li>
  <li><strong>Entry criteria:</strong> Exactly what conditions must be met to enter</li>
  <li><strong>Exit criteria:</strong> Where is your stop-loss? Where is your profit target?</li>
  <li><strong>Position sizing:</strong> How much will you risk per trade?</li>
  <li><strong>Max daily loss:</strong> If you lose X% today, you stop trading for the day</li>
  <li><strong>Review process:</strong> How often will you review and improve?</li>
</ol>
<h4>The Most Important Rule</h4>
<p>Follow the plan. If a trade doesn't meet all your criteria — skip it. The trades you don't take are sometimes your best trades.</p>
<h4>Key Takeaway</h4>
<p>Write your plan down. Review it before every trading session. The goal is to make your trading mechanical, not emotional. Professionals follow process — amateurs follow feelings.</p>
    `
  },

  // ── MODULE 5: ADVANCED ────────────────────────────────────────────────────
  {
    id: 'advanced-1',
    module: 'Advanced',
    title: 'Market Cycles',
    duration: 4,
    tc: 25,
    content: `
<h3>Market Cycles</h3>
<p>Markets move in cycles — periods of expansion followed by contraction. Understanding where you are in the cycle helps you make better decisions.</p>
<h4>The Four Phases</h4>
<ol>
  <li><strong>Accumulation:</strong> Smart money quietly buys after a bear market. Prices are flat, sentiment is negative. Best time to buy.</li>
  <li><strong>Mark-up:</strong> Prices begin rising. Trend followers join in. Momentum builds. Main bull market phase.</li>
  <li><strong>Distribution:</strong> Smart money starts selling to late buyers. Volume picks up, prices are volatile. Danger zone.</li>
  <li><strong>Mark-down:</strong> Bear market. Prices fall. Late buyers panic sell. Repeats.</li>
</ol>
<h4>Economic Cycles</h4>
<p>Different sectors perform differently at different stages:<br>
<strong>Early recovery:</strong> Financials, consumer discretionary<br>
<strong>Mid cycle:</strong> Technology, industrials<br>
<strong>Late cycle:</strong> Energy, materials<br>
<strong>Recession:</strong> Utilities, healthcare, consumer staples</p>
<h4>Key Takeaway</h4>
<p>The best returns come from buying during accumulation when everyone is fearful, and selling during distribution when everyone is euphoric. Be greedy when others are fearful.</p>
    `
  },
  {
    id: 'advanced-2',
    module: 'Advanced',
    title: 'Understanding Options (Intro)',
    duration: 5,
    tc: 25,
    content: `
<h3>Understanding Options (Introduction)</h3>
<p>Options are contracts that give you the right — but not the obligation — to buy or sell a stock at a specific price before a specific date.</p>
<h4>Call Options</h4>
<p>A call option gives you the right to <strong>buy</strong> 100 shares at the strike price. You buy calls when you expect the stock to go up. If AAPL is at $190 and you buy a $200 call, you profit if AAPL goes above $200 before expiry.</p>
<h4>Put Options</h4>
<p>A put option gives you the right to <strong>sell</strong> 100 shares at the strike price. You buy puts when you expect the stock to go down. Puts are like insurance on your portfolio.</p>
<h4>Key Terms</h4>
<ul>
  <li><strong>Strike price:</strong> The price at which you can buy/sell</li>
  <li><strong>Expiry:</strong> The date the option expires worthless if not used</li>
  <li><strong>Premium:</strong> The price you pay for the option contract</li>
  <li><strong>In the money:</strong> The option has intrinsic value</li>
  <li><strong>Out of the money:</strong> The option has no intrinsic value yet</li>
</ul>
<h4>Risk</h4>
<p>Options can expire worthless — you lose 100% of the premium. They are leveraged instruments and not suitable for beginners. Understand the basics thoroughly before trading real options.</p>
<h4>Key Takeaway</h4>
<p>Options are powerful but complex. Start by understanding calls and puts conceptually before ever risking real money on them.</p>
    `
  },
  {
    id: 'advanced-3',
    module: 'Advanced',
    title: 'Reading the Order Book',
    duration: 4,
    tc: 25,
    content: `
<h3>Reading the Order Book</h3>
<p>The order book (Level 2) shows all pending buy and sell orders for a stock at different price levels. It reveals supply and demand in real time.</p>
<h4>Bid vs Ask</h4>
<ul>
  <li><strong>Bid:</strong> The highest price buyers are willing to pay</li>
  <li><strong>Ask:</strong> The lowest price sellers are willing to accept</li>
  <li><strong>Spread:</strong> The difference between bid and ask (the market maker's profit)</li>
</ul>
<h4>What the Order Book Shows</h4>
<p>Large buy orders (large bid size) at a price level suggest strong support — buyers are defending that level. Large sell orders (large ask size) suggest resistance — sellers are waiting to unload there.</p>
<h4>Spoofing</h4>
<p>Large fake orders placed to manipulate perceived supply/demand, then cancelled before execution. Illegal but happens. Don't rely too heavily on the order book — it can be deceiving.</p>
<h4>Liquidity</h4>
<p>High liquidity = tight spread, easy to enter and exit. Low liquidity = wide spread, harder to trade. Always check liquidity before trading a stock. Stocks with less than 500k daily volume are considered illiquid.</p>
<h4>Key Takeaway</h4>
<p>The order book gives you a real-time view of supply and demand. Use it to identify where big players are positioned, but treat very large orders with scepticism.</p>
    `
  }
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

function getEarnedTC() {
  const completed = getCompletedLessons();
  return LESSONS.filter(l => completed.includes(l.id)).reduce((sum, l) => sum + l.tc, 0);
}

// ═══════════════════════════════════
//  LESSON UI
// ═══════════════════════════════════
const MODULES = ['Basics', 'Analysis', 'Strategy', 'Risk Management', 'Advanced'];

function loadAcademy() {
  const completed = getCompletedLessons();
  const totalLessons = LESSONS.length;
  const completedCount = completed.length;
  const earned = getEarnedTC();
  const total = getTotalTC();

  document.getElementById('academy-progress-text').textContent = `${completedCount}/${totalLessons} lessons · ${earned}/${total} TC earned`;
  document.getElementById('academy-progress-bar').style.width = (completedCount / totalLessons * 100) + '%';

  const container = document.getElementById('academy-modules');
  container.innerHTML = MODULES.map(mod => {
    const lessons = LESSONS.filter(l => l.module === mod);
    const modCompleted = lessons.filter(l => completed.includes(l.id)).length;
    return `
      <div class="academy-module">
        <div class="academy-mod-header">
          <div>
            <div class="academy-mod-title">${mod}</div>
            <div class="academy-mod-sub">${modCompleted}/${lessons.length} completed</div>
          </div>
          <div class="academy-mod-tc">+${lessons.reduce((s,l)=>s+l.tc,0)} TC</div>
        </div>
        ${lessons.map(l => `
          <div class="academy-lesson ${completed.includes(l.id) ? 'completed' : ''}" data-lesson="${l.id}">
            <div class="lesson-icon">${completed.includes(l.id) ? '✅' : '📖'}</div>
            <div class="lesson-info">
              <div class="lesson-title">${l.title}</div>
              <div class="lesson-meta">${l.duration} min read · +${l.tc} TC</div>
            </div>
            <button class="lesson-btn ${completed.includes(l.id) ? 'done' : ''}" data-open="${l.id}">
              ${completed.includes(l.id) ? 'Review' : 'Start →'}
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');

  // Add click handlers for lesson buttons
  container.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => openLesson(btn.dataset.open));
  });
}

function openLesson(id) {
  const lesson = LESSONS.find(l => l.id === id);
  if (!lesson) return;
  const already = isLessonCompleted(id);

  document.getElementById('lesson-modal-title').textContent = lesson.title;
  document.getElementById('lesson-modal-body').innerHTML = lesson.content;
  document.getElementById('lesson-modal-meta').textContent = `${lesson.module} · ${lesson.duration} min read`;

  const btn = document.getElementById('lesson-complete-btn');
  if (already) {
    btn.textContent = '✅ Already completed';
    btn.disabled = true;
    btn.style.background = 'var(--card2)';
    btn.style.color = 'var(--txt2)';
  } else {
    btn.textContent = `Complete & Earn +${lesson.tc} TC 🪙`;
    btn.disabled = false;
    btn.style.background = 'var(--green)';
    btn.style.color = '#000';
    btn.onclick = () => completeLesson(id, lesson.tc);
  }

  document.getElementById('lesson-modal').classList.add('open');
}

function completeLesson(id, tc) {
  markLessonComplete(id);
  userCoins += tc;
  localStorage.setItem('tf_coins', userCoins);
  updateCoinsDisplay();
  document.getElementById('lesson-modal').classList.remove('open');
  loadAcademy();
  toast(`+${tc} TC earned! 🪙`, 'success');
}
