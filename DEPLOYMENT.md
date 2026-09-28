# 🚀 Cloudflare Pages + Render Production Deployment Guide

This project is pre-configured for zero-friction dual deployment:
- **Backend API**: Hosted on [Render](https://render.com) (FastAPI + Gunicorn + Uvicorn)
- **Frontend SPA**: Hosted on [Cloudflare Pages](https://pages.cloudflare.com) (React 18 + Vite + Tailwind)

---

## 🛠️ Part 1: Deploy Backend on Render (1-Click Blueprint)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) Blueprint file.

### Step 1.1: Connect GitHub Repo to Render
1. Sign in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** (top right) and select **Blueprint**.
3. Connect your GitHub repository: `DHIRAJ-GHOLAP/interior-automation`.
4. Render will automatically detect [`render.yaml`](./render.yaml) and configure:
   - **Service Name**: `interior-automation-backend`
   - **Environment**: `Python 3.12`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
   - **Health Check Path**: `/api/health`

### Step 1.2: Deploy
1. Click **Apply Blueprint**.
2. Render will build and launch your backend web service.
3. Once deployed, copy your public Render URL (e.g. `https://interior-automation-backend.onrender.com`).
4. Test health in browser or terminal:
   ```bash
   curl https://interior-automation-backend.onrender.com/api/health
   # Response: {"status":"healthy","service":"InteriorFlow SaaS", ...}
   ```

---

## ⚡ Part 2: Deploy Frontend on Cloudflare Pages

Cloudflare Pages provides global CDN edge delivery with zero cold starts.

### Step 2.1: Connect to Cloudflare Pages
1. Sign in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, go to **Workers & Pages** ➔ **Create application** ➔ select **Pages**.
3. Choose **Connect to Git** and authorize your GitHub account.
4. Select repository: `DHIRAJ-GHOLAP/interior-automation`.

### Step 2.2: Configure Build Settings
Fill in the deployment parameters:
- **Project Name**: `interior-automation` (or any custom name)
- **Production Branch**: `main`
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`

### Step 2.3: Set Environment Variables
Under **Environment Variables** (Production):
| Variable Name | Value | Note |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://interior-automation-backend.onrender.com` | Your Render backend URL from Part 1 |
| `NODE_VERSION` | `20` | Recommended LTS Node version |

### Step 2.4: Deploy
1. Click **Save and Deploy**.
2. Cloudflare will build your Vite React app and publish it to `https://interior-automation.pages.dev`.
3. The included [`frontend/public/_redirects`](./frontend/public/_redirects) automatically guarantees client-side SPA routing (`/* -> /index.html 200`) so direct links to `/quote/:token` never 404.

---

## 🔒 Security & CORS Architecture

1. **Auto CORS Regex**: The backend in [`backend/app/main.py`](./backend/app/main.py) automatically allows origins matching `https://*.pages.dev`, `https://*.onrender.com`, and `http://localhost:*`.
2. **Security Headers**: [`frontend/public/_headers`](./frontend/public/_headers) sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict origin referrer policies.
3. **Data Protection**: Public quote links (`/quote/:token`) expose only client-facing rates, strictly shielding internal wholesale costs and margins.
