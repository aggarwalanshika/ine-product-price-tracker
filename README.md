# INE Product Price Tracker (Web Scraping & Analytics)

- **🌐 Live Hosted Site**: [https://aggarwalanshika.github.io/ine-product-price-tracker/](https://aggarwalanshika.github.io/ine-product-price-tracker/)
- **🐙 GitHub Repository**: [https://github.com/aggarwalanshika/ine-product-price-tracker](https://github.com/aggarwalanshika/ine-product-price-tracker)

A full-stack luxury web application built for the **INE Software Engineer Intern Assignment**. The application enables users to search INE's hosted mock storefront (`https://demo.inelabteamdev.com`), track products, scrape prices and stock levels on a fixed 2-hour schedule, view interactive price history charts and honest scrape attempt logs, and trigger observable headed scraper runs with video recording.

---

## 🌟 Features & Highlights

- **Royal Burgundy & Gold Glassmorphic Dashboard**: Premium user interface designed with rich product artwork, gold gradient highlights, smooth micro-animations, and glassmorphism.
- **Product Search & Tracking**: Real-time store catalog search by full or partial product name or SKU. Persists tracked items in Supabase (PostgreSQL).
- **Scheduled 2-Hour Scraping**: Powered by Playwright with realistic hover physics (`minMoves: 8`, `minDwellMs: 600`), WASM challenge handling, rate-limit (429) retries, exponential backoff, and server error recovery.
- **Honest Audit Logging**: Every scrape attempt (success, retried, or failed) is recorded honestly with exact duration (ms), HTTP status, extracted values, and failure tracebacks.
- **Price History Analytics**: Interactive Recharts area charts displaying price trends, lowest recorded price, highest price, and stock levels over time.
- **Observable Headed Run**: Trigger Playwright in headed mode (`headless: false`) to watch the scraper navigate, hover, and reveal prices live, generating downloadable `.webm` screen recordings.
- **Price Drop & Back-in-Stock Alerts**: Automated notifications flagging price drops and stock changes.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Recharts, Lucide Icons (Deployed on **Vercel**).
- **Backend**: Node.js (Express), Playwright Browser Automation Engine (Deployed on **Render**).
- **Database**: Supabase (PostgreSQL) with fallback local storage adapter for zero-config offline runs.
- **Cron Scheduling**: External trigger endpoint (`GET /api/scrape/cron`) for **cron-job.org** or Vercel Cron.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
STORE_BASE_URL=https://demo.inelabteamdev.com
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CRON_SECRET=ine-secret-cron-key-2026
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/ine-product-price-tracker.git
cd ine-product-price-tracker

# Install Backend Dependencies & Playwright Chromium
cd backend
npm install
npx playwright install chromium

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Database Setup (Supabase)
1. Create a new PostgreSQL project on [Supabase](https://supabase.com).
2. Open the Supabase SQL Editor and execute the schema script found in [`database/schema.sql`](file:///c:/Users/LENOVO/OneDrive/Desktop/INE/database/schema.sql).
3. Copy your project URL and Service Role Key to `backend/.env`.

> *Note: If Supabase credentials are omitted, the backend automatically uses a local JSON fallback database (`local_db.json`), ensuring out-of-the-box runnability.*

### 3. Run Locally

```bash
# Terminal 1: Run Backend Express API (Port 5000)
cd backend
npm run dev

# Terminal 2: Run Frontend React Vite Dev Server (Port 3000)
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## ⏰ Cron Job Setup (cron-job.org)

To ensure scheduled scraping continues across free-tier Render backend sleep cycles:

1. Create a free account on [cron-job.org](https://cron-job.org).
2. Create a new Cron Job:
   - **URL**: `https://your-render-backend.onrender.com/api/scrape/cron?secret=ine-secret-cron-key-2026`
   - **Execution Schedule**: Every 2 hours (`0 */2 * * *`)
   - **Request Method**: `GET`
3. Save the job. `cron-job.org` will trigger the scheduled scrape every 2 hours and wake up the Render instance if sleeping.

---

## 🎥 Observable Headed Run

1. Open the live site dashboard.
2. Click **Headed Demo** on any tracked product card.
3. The backend will launch Playwright in headed Chromium mode, complete hover interactions, reveal prices, and save a screen video recording accessible directly from the dashboard modal.
