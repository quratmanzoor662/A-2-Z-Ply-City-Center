# Production deploy (fix empty Vercel site)

Vercel hosts only the **frontend**. The catalog needs a **public FastAPI URL**.  
`http://localhost:8000` works on your laptop only — Vercel cannot reach it.

## 1) Deploy backend on Render

1. Go to [https://render.com](https://render.com) → New → Web Service
2. Connect GitHub repo `quratmanzoor662/A-2-Z-Ply-City-Center`
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Docker (uses `backend/Dockerfile`)
   - Or Native Python:
     - Build: `pip install -r requirements.txt`
     - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment variables (copy from local `backend/.env`):

```text
MONGODB_URI=mongodb+srv://...
MONGODB_DB=A-2-Zplycitycenter
JWT_SECRET=use-a-long-random-secret
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://a-2-z-ply-city-center.vercel.app
CLOUDINARY_CLOUD_NAME=axtspqrc
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_EMAIL=admin@a2zply.com
ADMIN_PASSWORD=admin123
```

5. Deploy, then open: `https://YOUR-SERVICE.onrender.com/api/health`  
   You should see `{"status":"ok"}`

6. Seed once (from your laptop against Atlas — already done if DB has products).  
   If empty, run locally with the same `MONGODB_URI`:

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. python -m app.seed
```

## 2) Point Vercel frontend to that API

In Vercel → Project → Settings → Environment Variables:

```text
NEXT_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=axtspqrc
```

Redeploy the frontend (Deployments → Redeploy).

## 3) Verify

- `https://YOUR-SERVICE.onrender.com/api/products` returns products
- `https://a-2-z-ply-city-center.vercel.app` shows banners, products, categories

## Local development (unchanged)

```bash
# backend
cd backend && source .venv/bin/activate
PYTHONPATH=. uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
# .env.local → NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```
