# CardSense

**AI-powered credit card optimizer for Indian users.**

CardSense analyzes your spending, tells you which card to use before each purchase, and shows you exactly how much cashback you're leaving on the table — powered by the [Claude API](https://www.anthropic.com/).

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Analyzes your full transaction history. Shows total spend, cashback earned vs. the maximum possible, missed savings by category, and a table of top missed opportunities. |
| **Card Advisor** | Tell it a merchant and amount — it recommends the optimal card in real time with a cashback estimate and ranked alternatives. |
| **Chat** | Conversational AI advisor. Knows your cards and all your recent transactions. Ask anything: *"Which card for Zomato?"*, *"How much cashback did I miss last month?"* |

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, React Router v6, Recharts |
| Backend | Node.js, Express 4 |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |

---

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

---

## Local Development

Both servers run independently. Vite proxies all `/api/*` requests to the Express backend, so no CORS configuration is needed.

### 1. Clone and install

```bash
git clone <repo-url>
cd CardSense

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# From the repo root
cp .env.example backend/.env
```

Open `backend/.env` and set your key:

```
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
PORT=3001
```

### 3. Start the backend

```bash
cd backend
npm run dev        # uses nodemon — auto-restarts on file changes
```

The Express server starts on `http://localhost:3001`.

### 4. Start the frontend

```bash
cd frontend
npm run dev        # Vite dev server, usually http://localhost:5173
```

Vite is configured to proxy every `/api/*` request to `localhost:3001`, so the frontend can call `/api/recommend` without a full URL and without any CORS headers.

Open `http://localhost:5173` in your browser.

---

## Production Build

In production a single Node.js process handles both the API and the React app.

### 1. Build the frontend

```bash
cd frontend
npm run build      # outputs to frontend/dist/
```

### 2. Run the backend in production mode

```bash
cd backend
NODE_ENV=production node server.js
```

When `NODE_ENV=production`, Express serves `frontend/dist` as static files and adds a catch-all route that returns `index.html` for client-side navigation. Open `http://localhost:3001`.

---

## Azure Deployment (App Service)

1. Set the **startup command** to `node backend/server.js`.
2. In **App Service → Configuration → Application settings**, add:

   | Name | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | your key |
   | `NODE_ENV` | `production` |
   | `PORT` | `8080` (App Service default) |

3. Deploy the repo (zip deploy, GitHub Actions, etc.). The build step (`cd frontend && npm run build`) must run before or during deployment so `frontend/dist` is present.

---

## Project Structure

```
CardSense/
├── backend/
│   ├── data/
│   │   ├── cards.json          # Card definitions and reward rates
│   │   └── transactions.json   # Sample transaction history
│   ├── services/
│   │   └── claude.js           # recommend / analyze / chat — all Claude calls
│   ├── server.js               # Express app and API routes
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Advisor.jsx
│   │   │   └── Chat.jsx
│   │   └── main.jsx            # App shell, routing, nav
│   ├── vite.config.js          # Dev proxy: /api → localhost:3001
│   └── package.json
└── .env.example
```

---

## API Reference

All endpoints accept and return JSON.

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/recommend` | `{ merchant, amount, category? }` | Returns the best card and ranked alternatives for a purchase. |
| `POST` | `/api/analyze` | _(none)_ | Analyzes stored transactions. Returns spend totals, cashback earned vs. possible, missed savings by category, and top missed transactions. |
| `POST` | `/api/chat` | `{ message, history? }` | Sends a message to the conversational advisor. `history` is an array of `{ role, content }` pairs for multi-turn context. |
