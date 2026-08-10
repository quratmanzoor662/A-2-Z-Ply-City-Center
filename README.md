# A-2-Z Ply City Center

Premium plywood & hardware product catalog with a customer storefront and admin panel.

## Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Swiper
- **Backend:** FastAPI, MongoDB (Motor), JWT auth, Cloudinary uploads

## Prerequisites

- Node.js 20+
- Python 3.11+ (3.13/3.14 supported with current requirements)
- MongoDB running locally on `mongodb://localhost:27017`

### Start MongoDB

**Docker (if installed):**

```bash
docker compose up -d
```

**Homebrew MongoDB:**

```bash
brew services start mongodb/brew/mongodb-community@7.0
```

**Or run mongod manually** (creates data in `.data/db`):

```bash
mkdir -p .data/db
mongod --dbpath .data/db --port 27017 --bind_ip 127.0.0.1
```

## Setup

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edit Cloudinary keys when ready
uvicorn app.main:app --reload --port 8000
```

In another terminal, seed demo data:

```bash
cd backend
source .venv/bin/activate
python -m app.seed
```

Default admin: `admin@a2zply.com` / `admin123`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  
Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Environment

**Backend `.env`**

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for admin JWT |
| `CLOUDINARY_*` | Cloudinary credentials for signed admin uploads |
| `CORS_ORIGINS` | Comma-separated frontend URLs (local + Vercel) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin credentials |

**Frontend `.env.local` (local)**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | FastAPI base URL (`http://localhost:8000`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |

**Vercel (production frontend)**

```text
BACKEND_URL=https://YOUR-PUBLIC-API.onrender.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=axtspqrc
```

Remove any `NEXT_PUBLIC_API_URL=http://localhost:8000` from Vercel.  
Production uses same-origin `/api-backend` proxy (never localhost). See [DEPLOY.md](DEPLOY.md).

**Backend host (Render / Railway / etc.)**

Set the same env vars as `backend/.env`, especially:

```text
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://a-2-z-ply-city-center.vercel.app
```

Redeploy the API after changing `CORS_ORIGINS`.

## Phase 1 features

- Storefront: home, categories, product listing/filters, product detail with variants & gallery, WhatsApp quote + enquiry save
- Admin: dashboard, products (images/variants/specs), categories, brands, banners, enquiries, settings
