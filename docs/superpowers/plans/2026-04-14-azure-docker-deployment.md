# CardSense Azure Web App for Containers Deployment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy CardSense to Azure Web App for Containers using a multi-stage Docker image hosted on ghcr.io, with GitHub Actions CI/CD on every push to `main`.

**Architecture:** A multi-stage Dockerfile builds the Vite frontend then packages it alongside the Express backend into a single lean Node 22 Alpine image. GitHub Actions pushes the image to ghcr.io and tells Azure to pull the new image. Azure Web App for Containers runs the single container which serves both the React SPA and `/api/*` routes on port 3001.

**Tech Stack:** Docker (multi-stage, node:22-alpine), GitHub Container Registry (ghcr.io), GitHub Actions, Azure Web App for Containers (Linux)

---

### Task 1: Create `.dockerignore`

**Files:**
- Create: `.dockerignore`

- [ ] **Step 1: Create `.dockerignore` at repo root**

```
node_modules
**/node_modules
frontend/dist
.git
.github
.env
.env.*
!.env.example
*.zip
docs
README.md
.claude
.playwright-mcp
```

- [ ] **Step 2: Verify it exists**

```bash
cat .dockerignore
```

Expected: file contents printed with no errors.

- [ ] **Step 3: Commit**

```bash
git add .dockerignore
git commit -m "chore: add .dockerignore for Docker build"
```

---

### Task 2: Create multi-stage `Dockerfile`

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1: Create `Dockerfile` at repo root**

```dockerfile
# ── Stage 1: Build React frontend ─────────────────────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

# Install backend production dependencies only
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy compiled frontend from stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
EXPOSE 3001

WORKDIR /app/backend
CMD ["node", "server.js"]
```

- [ ] **Step 2: Verify the build works locally**

```bash
docker build -t cardsense:local .
```

Expected: Build completes successfully. You should see two stages complete — `frontend-build` then `production`. Final image size should be under 300MB.

- [ ] **Step 3: Smoke-test the container locally**

```bash
docker run --rm -p 3001:3001 \
  -e ANTHROPIC_API_KEY=sk-ant-test-key \
  cardsense:local
```

Open `http://localhost:3001` in a browser. Expected: React app loads (even if API calls fail without a real key).
Stop the container with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add Dockerfile
git commit -m "chore: add multi-stage Dockerfile for production build"
```

---

### Task 3: Create GitHub Actions workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create workflow directory and file**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Write `.github/workflows/deploy.yml`**

```yaml
name: Build and Deploy to Azure

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository_owner }}/cardsense

jobs:
  build-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ env.IMAGE_NAME }}:latest
            ghcr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy:
    runs-on: ubuntu-latest
    needs: build-push

    steps:
      - name: Log in to Azure
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          images: ghcr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for Azure container deployment"
```

---

### Task 4: Create Azure Web App for Containers (Portal GUI)

> This is a manual portal step. No code to write.

- [ ] **Step 1: Go to portal.azure.com → search "Web App" → click Create**

- [ ] **Step 2: Fill in Basics tab**

  | Field | Value |
  |-------|-------|
  | Subscription | Azure for Students |
  | Resource Group | `cardsense-rg` (create new if needed) |
  | Name | `cardsense` (or any unique name — this becomes your URL) |
  | Publish | **Docker Container** |
  | Operating System | **Linux** |
  | Region | **East US** (or whichever is available) |
  | Pricing plan | **Free F1** (click "Explore pricing plans" if not shown) |

- [ ] **Step 3: Click "Next: Docker"**

  | Field | Value |
  |-------|-------|
  | Options | Single Container |
  | Image Source | Docker Hub or other registries |
  | Access Type | **Public** (we will make the ghcr.io package public in Task 6) |
  | Image and tag | `ghcr.io/<your-github-username>/cardsense:latest` |

  Leave Server URL, Username, Password blank for now (public image).

- [ ] **Step 4: Click "Review + create" → Create**

  Wait for deployment to finish (about 1-2 minutes).

- [ ] **Step 5: Note your Web App URL**

  It will be `https://cardsense.azurewebsites.net` (or whatever name you chose). Save this — it's your production URL.

---

### Task 5: Configure Azure App Settings (Portal GUI)

> This is a manual portal step. No code to write.

- [ ] **Step 1: Open your new Web App in the portal → left sidebar → Configuration → Application settings**

- [ ] **Step 2: Add these settings (click "+ New application setting" for each)**

  | Name | Value | Deployment slot setting |
  |------|-------|------------------------|
  | `NODE_ENV` | `production` | No |
  | `WEBSITES_PORT` | `3001` | No |
  | `ANTHROPIC_API_KEY` | `sk-ant-...` (your real key) | Yes (check the box) |

  Checking "Deployment slot setting" for `ANTHROPIC_API_KEY` keeps it from being swapped if you ever use staging slots — good practice for secrets.

- [ ] **Step 3: Click Save → Continue**

  Azure will restart the container. This is expected.

---

### Task 6: Make the ghcr.io package public

> This is a manual GitHub step done after the first push triggers a build.

- [ ] **Step 1: Push the current branch to trigger the first GitHub Actions run**

```bash
git push origin main
```

- [ ] **Step 2: Wait for the `build-push` job to complete**

  Go to your GitHub repo → Actions tab → watch the workflow run. The `build-push` job will create the `cardsense` package on ghcr.io. The `deploy` job will fail (no secrets yet) — that's fine.

- [ ] **Step 3: Make the package public**

  GitHub → your profile → Packages → `cardsense` → Package settings (bottom of sidebar) → Change visibility → **Public** → type `cardsense` to confirm.

  This lets Azure pull the image without credentials.

---

### Task 7: Create Service Principal and add GitHub Secrets

> Cloud Shell steps (click the `>_` button in the Azure portal top bar — no local install needed).

- [ ] **Step 1: Open Azure Cloud Shell (Bash)**

  In the portal top bar, click the `>_` icon. Choose **Bash** if prompted.

- [ ] **Step 2: Find your subscription ID**

```bash
az account show --query id -o tsv
```

Copy the output — it's your `<SUB_ID>`.

- [ ] **Step 3: Create the service principal**

```bash
az ad sp create-for-rbac \
  --name cardsense-gh-actions \
  --role contributor \
  --scopes /subscriptions/<SUB_ID>/resourceGroups/cardsense-rg \
  --sdk-auth
```

Copy the entire JSON block that is printed. It looks like:
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  ...
}
```

- [ ] **Step 4: Add GitHub secrets**

  Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret.

  Add these two secrets:

  | Secret name | Value |
  |-------------|-------|
  | `AZURE_CREDENTIALS` | The entire JSON block from Step 3 |
  | `AZURE_WEBAPP_NAME` | The exact Web App name you chose in Task 4 (e.g. `cardsense`) |

---

### Task 8: Trigger and verify first full deployment

- [ ] **Step 1: Push any change to trigger a fresh run**

```bash
git commit --allow-empty -m "ci: trigger first full deployment"
git push origin main
```

- [ ] **Step 2: Watch the GitHub Actions run**

  Repo → Actions → latest run. Both `build-push` and `deploy` jobs should go green. Full run takes about 3-5 minutes (Docker build is the slow part).

- [ ] **Step 3: Verify the app is live**

  Open `https://<your-app-name>.azurewebsites.net` in a browser.

  Expected: React app loads. Test each feature:
  - Card recommendation (`/`) — enter a merchant and amount
  - Dashboard (`/dashboard`) — should show analysis
  - Chat — should respond

- [ ] **Step 4: Check logs if something looks wrong**

  Azure portal → your Web App → left sidebar → Log stream. Look for:
  ```
  CardSense backend running on port 3001 [production]
  ```
  If you see a port mismatch error, verify `WEBSITES_PORT=3001` is set in Application settings.
