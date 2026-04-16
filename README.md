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
| Container | Docker (multi-stage build), GitHub Container Registry (GHCR) |
| Hosting | Azure App Service (container deployment) |

---

## Prerequisites

- Node.js 22+
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

## Azure Deployment (App Service — Container)

Deployments are automated via `.github/workflows/deploy.yml`. Every push to `main`:

1. Builds a Docker image using the multi-stage `Dockerfile` (React frontend compiled in stage 1, lean production image in stage 2)
2. Pushes the image to GitHub Container Registry (`ghcr.io/<owner>/cardsense`)
3. Deploys the image to Azure App Service

### One-time setup

**1. Create an Azure App Service for containers**

When creating the App Service, choose **Publish: Docker Container** (not Code). Select Linux as the OS.

**2. Allow GHCR pulls from Azure**

The App Service needs to authenticate with GHCR to pull the image. In your GitHub repo, go to **Settings → Packages → cardsense** and add the Azure service principal (or use a Personal Access Token with `read:packages` scope) as a collaborator, or make the package public.

Set the registry credentials in **App Service → Configuration → Application settings**:

| Name | Value |
|---|---|
| `DOCKER_REGISTRY_SERVER_URL` | `https://ghcr.io` |
| `DOCKER_REGISTRY_SERVER_USERNAME` | your GitHub username |
| `DOCKER_REGISTRY_SERVER_PASSWORD` | a GitHub PAT with `read:packages` scope |

**3. Set app environment variables**

In the same **Application settings** tab, add:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your key |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |

**4. Add GitHub secrets**

In your GitHub repo, go to **Settings → Secrets and variables → Actions** and add:

| Secret | How to get it |
|---|---|
| `AZURE_WEBAPP_NAME` | The name of your App Service (e.g. `cardsense`) |
| `AZURE_CREDENTIALS` | A service principal JSON — run `az ad sp create-for-rbac --name cardsense-deploy --role contributor --scopes /subscriptions/<id>/resourceGroups/<rg> --sdk-auth` and paste the output |

Once all secrets are set, push to `main` to trigger the first deployment. To manually retrigger without a code change:

```bash
git commit --allow-empty -m "retrigger deployment"
git push origin main
```

---

## Troubleshooting

### Image pull fails — App Service can't start the container
- Check `DOCKER_REGISTRY_SERVER_URL/USERNAME/PASSWORD` are set correctly in **Application settings**
- Make sure the GitHub PAT has `read:packages` scope and hasn't expired
- If the GHCR package is private, confirm the PAT owner has access to the package

### `AZURE_CREDENTIALS` secret rejected in GitHub Actions
- The service principal JSON must be the full output of `az ad sp create-for-rbac --sdk-auth`
- Confirm the SP has `Contributor` role on the App Service resource group
- Re-run `az ad sp create-for-rbac` and replace the secret if it has expired

### App crashes on Azure but works locally
- Verify all environment variables are set in **App Service → Configuration → Application settings** — Azure doesn't read your local `.env` file
- Stream live logs: **App Service → Monitoring → Log stream**
- Run the image locally to reproduce: `docker run -p 3001:3001 -e ANTHROPIC_API_KEY=sk-ant-... ghcr.io/<owner>/cardsense:latest`

### Frontend loads but API calls return errors
- Confirm `NODE_ENV=production` is set in Azure environment variables — without it Express won't serve the frontend or the catch-all route
- Confirm `PORT=3001` matches the `EXPOSE` value in the Dockerfile; Azure routes external traffic to whatever port is set here

### Container starts but immediately exits
- Check the Log stream for the actual error — most common causes are a missing `ANTHROPIC_API_KEY` or a wrong `PORT`

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
