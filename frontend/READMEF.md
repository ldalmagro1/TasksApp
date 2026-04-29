# Notes App — Frontend

React 19 + Vite SPA for the application, built with a modern NextUI interface.

---

## Runtimes & Tools

| Tool / Dependency | Exact version |
|---|---|
| Node.js | 20 (Docker image: `node:20-alpine`) |
| npm | bundled with Node 20 |
| React | ^19.2.5 |
| React DOM | ^19.2.5 |
| Vite | ^8.0.10 |
| TypeScript | ~6.0.2 |
| `@nextui-org/react` | Latest |
| `tailwindcss` | ^3.4.17 (with PostCSS and Autoprefixer) |
| `framer-motion` | Latest (NextUI dependency) |
| ESLint | ^10.2.1 |
| nginx | alpine (Docker image: `nginx:alpine`, production only) |

---

## Login

**No authentication is required.** There is no login screen.

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── NoteCard.tsx         # Renders a single note with actions
│   │   ├── NoteFormModal.tsx    # Create/edit note modal form
│   │   ├── ConfirmModal.tsx     # Generic confirmation dialog
│   │   └── Toast.tsx            # Ephemeral notification component
│   ├── services/
│   │   └── api.ts               # Typed HTTP client (fetch wrapper)
│   ├── types/
│   │   └── index.ts             # Note and Category TypeScript interfaces
│   ├── App.tsx                  # Root component — NextUI layout, state, routing
│   ├── App.css                  # (Empty, replaced by Tailwind)
│   ├── index.css                # Tailwind base directives
│   └── main.tsx                 # React DOM entry point
├── public/
├── nginx.conf                   # SPA routing + /api reverse proxy (Docker)
├── Dockerfile
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR at `http://localhost:5173` |
| `npm run build` | Type-check and build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint with ESLint |

---

## Running Locally

### Prerequisites

- Node.js 20+
- Backend API running at `http://localhost:3000` (see [backend README](../backend/README.md))

### Setup

```bash
npm install
npm run dev
```

App will be available at: **http://localhost:5173**

> Vite automatically proxies all `/api/*` requests to `http://localhost:3000` in dev mode — no CORS configuration needed.

---

## Running with Docker

From the **project root**:

```bash
docker compose up --build -d
```

The frontend service builds with `node:20-alpine`, then serves the static bundle via `nginx:alpine` on port `5173` (mapped to container port `80`).  
The `nginx.conf` file handles SPA routing (all routes → `index.html`) and reverse-proxies `/api/*` to the backend container.

---

## API Communication

All backend calls are made through `src/services/api.ts`, a typed wrapper around the browser `fetch` API. The base URL resolves to `/api` (relative), which works identically in both local dev (proxied by Vite) and Docker (proxied by nginx).
