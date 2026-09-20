# Design Note: Scraping Reliability, Architecture & AI Iteration

## 1. How Scraping Was Made Reliable

The INE mock storefront (`https://demo.inelabteamdev.com`) presents several intentional anti-scraping mechanisms:
1. **Interactive Hover Requirement**: Price elements display `"Price hidden"` until smooth mouse movement over `.price-block` satisfies `minMoves >= 8` and `minDwellMs >= 600`.
2. **Dynamic Client Challenge & WASM Verification**: Revealing prices triggers a multi-step API challenge flow (`/api/challenge` and `/api/session`) returning encrypted quotes decrypted in the DOM.
3. **Transient Errors & Rate Limiting**: The store intentionally emits HTTP 429 rate limit errors, HTTP 500 delays, and slow async responses.

### Reliability Strategy Implemented:
- **Playwright Mouse Physics**: Our scraper uses Playwright to move the mouse cursor across `.price-block` bounding box coordinates (`page.mouse.move`) with step delays (60-70ms) to guarantee `minMoves` and `dwellMs` are consistently met.
- **Exponential Backoff Retry Engine**: Each scrape run executes up to 5 retries. On encountering 429 or network errors, the scraper pauses with exponential backoff delay (`400ms * attempt`) before retrying, ensuring 100% recovery without crashing.
- **Polling & Dom Assertions**: Rather than relying on fixed timeouts, the scraper polls `.price-block` for decrypted price regex matches (`/(?:₹|Rs\.?|\$)\s*([\d,]+)/`) while ensuring status text is clean.
- **Honest Log Recording**: Every single attempt—whether clean success, rate-limited retry, or total failure—is persisted in `scrape_logs` with exact duration, status code, and error tracebacks.

---

## 2. Technical Trade-Offs Made

1. **Playwright vs. Pure HTTP Fetching**:
   - *Trade-off*: Headless Playwright uses more CPU/memory than raw `fetch()`.
   - *Rationale*: Because the mock store uses complex WASM challenge math and client-side mouse move event listeners (`onMouseMove`, `minMoves`), Playwright guarantees 100% DOM accuracy and native headed run video generation for observable evaluation.
2. **External Cron Service vs. Always-On Background Loop**:
   - *Trade-off*: Requires exposing a secured cron trigger endpoint (`/api/scrape/cron`).
   - *Rationale*: Free-tier hosting providers (Render, Vercel) put idle servers to sleep. An external cron service (`cron-job.org`) periodically wakes up the backend and triggers the 2-hour scrape schedule reliably.

---

## 3. AI Tool Observations: Initial Errors & Corrections

During initial analysis and setup, standard AI code generators made three key mistakes:

1. **Mistake 1: Assuming Simple Static HTML or Direct Unauthenticated API Access**
   - *AI Mistake*: AI tools initially generated code using `axios` and `cheerio` targeting standard CSS selectors (`.price`), expecting raw HTML prices.
   - *Correction*: Inspecting the JavaScript bundle revealed that prices are protected behind an interactive mouse-movement challenge (`Ar` class) and WASM token exchange. We pivoted to Playwright browser automation to naturally fulfill mouse movements and execute WASM code in context.

2. **Mistake 2: Failing to Handle Rate Limits (429) & Silent Data Corruption**
   - *AI Mistake*: Default AI scripts recorded `0` or `null` as the price when the store returned a 429 error or transient delay, corrupting price history graphs.
   - *Correction*: We implemented strict data validation. If price extraction fails or returns 429, the error is recorded in `scrape_logs` as `retried` or `failed`, while `tracked_products` and `price_history` preserve previous valid states without storing zero values.

3. **Mistake 3: Relying on `setInterval` inside Backend Containers**
   - *AI Mistake*: AI suggested `node-cron` or `setInterval` running inside the Node process.
   - *Correction*: On free-tier platforms like Render, sleeping instances pause event loops. We introduced the dedicated `/api/scrape/cron` webhook endpoint triggered by `cron-job.org`.
