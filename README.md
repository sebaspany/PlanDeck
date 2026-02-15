# PlanDeck - Planning Poker

Lightning-fast, zero-auth Planning Poker for agile teams. Create a session, share the link, vote in real-time.

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + Socket.io + Prisma ORM
- **Database:** MySQL

## Quick Start (Local)

### 1. Clone & Install

```bash
git clone https://github.com/sebaspany/PlanDeck.git
cd PlanDeck

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 2. Set Up Database

Create a MySQL database:

```sql
CREATE DATABASE plandeck;
```

Create a `.env` file in `server/`:

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/plandeck"
```

Push the schema:

```bash
cd server
npx prisma db push
```

### 3. Run Locally

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Open `http://localhost:5173`

## Deploy (Single Server)

The backend serves the frontend build in production, so you only need **one server** and a MySQL database.

### Option A: Railway (Easiest)

1. Sign up at [railway.app](https://railway.app) (free tier available)
2. Create a new project → **Deploy from GitHub repo**
3. Add a **MySQL** service in the same project
4. Set environment variables on the server service:
   - `DATABASE_URL` = the MySQL connection string from Railway (auto-provided if you link the services)
   - `PORT` = `3001`
5. Set **Root Directory** to `/` (project root)
6. Set **Build Command** to:
   ```
   cd client && npm install && npm run build && cd ../server && npm install && npx prisma generate && npx prisma db push && npm run build
   ```
7. Set **Start Command** to:
   ```
   cd server && node dist/index.js
   ```

### Option B: Render

1. Sign up at [render.com](https://render.com) (free tier available)
2. Create a **Web Service** → connect your GitHub repo
3. Create a **MySQL database** (or use a free one from [Aiven](https://aiven.io) or [PlanetScale](https://planetscale.com))
4. Set environment variables:
   - `DATABASE_URL` = your MySQL connection string
   - `PORT` = `3001`
5. Set **Build Command** to:
   ```
   cd client && npm install && npm run build && cd ../server && npm install && npx prisma generate && npx prisma db push && npm run build
   ```
6. Set **Start Command** to:
   ```
   cd server && node dist/index.js
   ```

### Option C: Split Deploy (Vercel + Railway)

If you prefer hosting the frontend on Vercel separately:

1. **Frontend (Vercel):** Import repo, set Root Directory to `client`, add env var `VITE_API_URL` = your backend URL
2. **Backend (Railway/Render):** Deploy `server/` with `DATABASE_URL` and `PORT` env vars

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `DATABASE_URL` | `server/.env` | MySQL connection string |
| `PORT` | `server/.env` | Server port (default: 3001) |
| `VITE_API_URL` | `client/.env` | Backend URL (only needed for split deploy) |

## How It Works

1. Click **New Session** to create a room
2. Share the link (copy or scan QR code)
3. Everyone picks a guest name and joins
4. Vote using Fibonacci cards (1, 2, 3, 5, 8, 13, 21, ?)
5. Click **Reveal** to flip all cards
6. Click **Reset** for the next round
