# CardSense — Azure Web App for Containers Deployment Design

**Date:** 2026-04-14
**Status:** Approved

## Architecture

Single Docker container running Express (Node 22 Alpine). The image is built in
two stages: Stage 1 compiles the React/Vite frontend; Stage 2 copies the built
`frontend/dist` alongside the Express backend into a lean production image.
Express serves both the static SPA and `/api/*` routes from one process on
port 3001.

The image is stored on **GitHub Container Registry (ghcr.io)**. GitHub Actions
builds and pushes it on every push to `main`, then tells Azure Web App for
Containers to pull the new image.

## Components

| Component | Technology |
|-----------|-----------|
| Container image | Docker multi-stage (node:22-alpine) |
| Image registry | ghcr.io (GitHub Container Registry) |
| Hosting | Azure Web App for Containers (Linux, F1 free tier) |
| CI/CD | GitHub Actions |
| Secret storage | Azure App Service Application Settings |

## Dockerfile (multi-stage)

- **Stage 1 `frontend-build`** — installs frontend deps, runs `vite build`,
  outputs `frontend/dist`
- **Stage 2 `production`** — installs backend prod deps only, copies
  `backend/` and the built `frontend/dist`, sets `NODE_ENV=production`,
  exposes port 3001, runs `node server.js`

## GitHub Actions Workflow

Two jobs on `push` to `main`:

1. **build-push** — logs into ghcr.io with `GITHUB_TOKEN` (no extra secret),
   builds and pushes image tagged `latest` + commit SHA
2. **deploy** — uses `azure/webapps-deploy@v3` with the `images` parameter
   pointing at the new ghcr.io image; authenticates via `AZURE_CREDENTIALS`
   service principal secret

## One-time Azure Setup (GUI + Cloud Shell)

1. **Web App** — portal → Create Web App → Publish: **Docker Container**,
   OS: **Linux**, App Service Plan: **F1 (Free)**
2. **Container settings** — Docker Hub / other registries →
   image: `ghcr.io/<username>/cardsense:latest`,
   registry login with a GitHub PAT (read:packages scope)
3. **App Settings** — Configuration → Application settings:
   - `NODE_ENV` = `production`
   - `WEBSITES_PORT` = `3001`
   - `ANTHROPIC_API_KEY` = `<secret>` (mark as slot setting)
4. **Service Principal** — Azure Cloud Shell:
   `az ad sp create-for-rbac --name cardsense-gh-actions --role contributor
   --scopes /subscriptions/<SUB_ID>/resourceGroups/<RG> --sdk-auth`
   → paste JSON as `AZURE_CREDENTIALS` GitHub secret

## GitHub Secrets

| Secret | Source |
|--------|--------|
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac` JSON output |
| `AZURE_WEBAPP_NAME` | Web App name chosen in portal |

`ANTHROPIC_API_KEY` lives in Azure App Settings — never in GitHub.

## Data Flow

```
git push main
  → GitHub Actions: docker build (multi-stage)
  → push ghcr.io/username/cardsense:latest
  → azure/webapps-deploy pulls new image
  → App Service restarts container
  → Express serves React SPA + /api/* on port 3001
```

## Error Handling

No changes to application error handling. `WEBSITES_PORT` tells App Service
which port to route traffic to; mismatches cause 503s and are the first thing
to check if the deploy succeeds but the app returns errors.
