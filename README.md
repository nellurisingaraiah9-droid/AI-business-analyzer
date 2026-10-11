# BizPilot AI

**Intelligent Business Idea Analyzer, Equipment Finder & License Advisor**

BizPilot AI helps entrepreneurs convert business ideas into detailed, location-aware business setup plans for India. Enter your business idea, location, and budget to receive a comprehensive analysis covering feasibility, equipment requirements, licensing, budgeting, and a step-by-step setup roadmap.

## Features

- **Business Feasibility Analysis** — Market assumptions, revenue scenarios, break-even estimates
- **Equipment Finder** — Machinery recommendations with specifications, pricing, and supplier info
- **Budget Calculator** — Deterministic cost breakdown across all startup categories
- **License & Compliance Finder** — Location-aware regulatory requirements with official sources
- **Setup Roadmap** — Dependency-aware, step-by-step business setup plan
- **AI-Powered Insights** — LLM-generated recommendations with structured outputs
- **Multi-Industry Support** — Manufacturing, food processing, retail, IT, agriculture, and more

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (Mongoose)
- **AI**: OpenAI-compatible LLM with structured outputs
- **Queue**: BullMQ + Redis (optional)
- **Charts**: Recharts

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional, for background jobs)
- An OpenAI API key (or compatible LLM provider)

### Installation

```bash
npm run install:all
```

### Configuration

Copy the example environment file and fill in your values:

```bash
cp server/.env.example server/.env
```

Required environment variables:
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) |
| `AI_API_KEY` | OpenAI or compatible API key |
| `AI_MODEL` | Model name (e.g., `gpt-4o`) |

### Running Development

```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 5173).

### Seeding Demo Data

```bash
npm run seed
```

Seeds the database with demo equipment, regulatory rules, and a sample analysis for testing.

## Project Structure

```
bizpilot-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── stores/         # State management
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── validators/     # Zod schemas
│   │   └── utils/          # Utilities
│   └── ...
├── docker-compose.yml
└── README.md
```

## API Documentation

See [server/API.md](server/API.md) for the complete REST API reference.

## Deployment

### Vercel (Frontend)
1. Connect your GitHub repo to Vercel
2. Set the root directory to `client`
3. Set build command: `npm run build`
4. Set output directory: `dist`

### Render (Backend)
1. Create a new Web Service on Render
2. Set the root directory to `server`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all environment variables from `.env.example`

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP
3. Copy the connection string to `MONGODB_URI`

## License

MIT
