# PlanDeck - Planning Poker

Lightning-fast, zero-auth Planning Poker for agile teams. Create a session, share the link, vote in real-time.

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + Socket.io + Prisma ORM
- **Database:** MySQL

## Quick Start

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

Create a `.env` file in `server/`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/plandeck"
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

## Deploy to Vercel + Railway/PlanetScale

### Frontend (Vercel)

1. Import the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `client`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. Add environment variable:
   - `VITE_API_URL` = your backend URL (e.g. `https://plandeck-api.up.railway.app`)

### Backend (Railway / Render / Fly.io)

1. Deploy the `server` directory
2. Set environment variables:
   - `DATABASE_URL` = your MySQL connection string (PlanetScale, Aiven, etc.)
   - `PORT` = `3001` (or let the platform assign one)
3. Run `npx prisma db push` as part of the build

### Database (PlanetScale / Aiven)

1. Create a MySQL database
2. Copy the connection string to `DATABASE_URL`

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `DATABASE_URL` | `server/.env` | MySQL connection string |
| `PORT` | `server/.env` | Server port (default: 3001) |
| `VITE_API_URL` | `client/.env` | Backend URL for production |

## How It Works

1. Click **New Session** to create a room
2. Share the link (copy or scan QR code)
3. Everyone picks a guest name and joins
4. Vote using Fibonacci cards (1, 2, 3, 5, 8, 13, 21, ?)
5. Click **Reveal** to flip all cards
6. Click **Reset** for the next round
