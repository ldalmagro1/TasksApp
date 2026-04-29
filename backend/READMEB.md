# NoteFlow — Backend

NestJS REST API for the NoteFlow notes application.

---

## Runtimes & Tools

| Tool / Dependency | Exact version |
|---|---|
| Node.js | 20 (Docker image: `node:20-alpine`) |
| npm | bundled with Node 20 |
| NestJS (`@nestjs/core`) | ^11.0.1 |
| `@nestjs/config` | ^4.0.4 |
| `@nestjs/typeorm` | ^11.0.1 |
| TypeORM | ^0.3.28 |
| PostgreSQL driver (`pg`) | ^8.20.0 |
| `class-validator` | ^0.15.1 |
| `class-transformer` | ^0.5.1 |
| TypeScript | ^5.7.3 |
| Jest | ^30.0.0 |
| Prettier | ^3.4.2 |
| ESLint | ^9.18.0 |

---
## Environment Variables

Copy `.env.example` to `.env` before running locally:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `DATABASE_HOST` | `localhost` | PostgreSQL host |
| `DATABASE_PORT` | `5432` | PostgreSQL port |
| `DATABASE_USER` | `notes_user` | PostgreSQL user |
| `DATABASE_PASSWORD` | `notes_pass` | PostgreSQL password |
| `DATABASE_NAME` | `notes_db` | PostgreSQL database name |
| `PORT` | `3000` | Port the API listens on |

> When running via Docker Compose, these variables are injected automatically through `docker-compose.yml`.

---

## Project Structure

```
backend/
├── src/
│   ├── notes/
│   │   ├── dto/
│   │   │   ├── create-note.dto.ts
│   │   │   └── update-note.dto.ts
│   │   ├── entities/
│   │   │   └── note.entity.ts       # TypeORM entity
│   │   ├── notes.controller.ts      # HTTP routing
│   │   ├── notes.service.ts         # Business logic
│   │   └── notes.module.ts
│   ├── categories/
│   │   ├── dto/
│   │   │   └── create-category.dto.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts   # TypeORM entity
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.module.ts
│   ├── app.module.ts                # Root module, TypeORM async config
│   └── main.ts                      # Bootstrap, CORS, global /api prefix
├── test/
├── .env.example
├── Dockerfile
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### Layer separation

| Layer | File | Responsibility |
|---|---|---|
| **Controller** | `*.controller.ts` | Receives HTTP requests, validates input, returns responses |
| **Service** | `*.service.ts` | Encapsulates business rules (archive logic, filtering) |
| **Repository** | TypeORM `Repository<T>` | Database queries, injected via NestJS DI |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start` | Start without watch |
| `npm run start:prod` | Start compiled production bundle |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run test` | Run unit tests with Jest |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and auto-fix with ESLint |
| `npm run format` | Format with Prettier |

---

## Running Locally

### Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally

### Setup

```bash
# 1. Create the PostgreSQL user and database
psql -U postgres -c "CREATE USER notes_user WITH PASSWORD 'notes_pass';"
psql -U postgres -c "CREATE DATABASE notes_db OWNER notes_user;"

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Start in development mode
npm run start:dev
```

API will be available at: **http://localhost:3000/api**

> TypeORM runs with `synchronize: true` in development — the schema is created/updated automatically on startup. No manual migrations are needed.

---

## Running with Docker

From the **project root**:

```bash
docker compose up --build -d
```

The backend service uses the `node:20-alpine` base image and exposes port `3000`.

---

## API Endpoints

### Swagger Documentation

A fully interactive Swagger UI is available at **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)** when the application is running. You can use it to explore all endpoints, DTO schemas, and test requests directly from the browser.

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notes` | List active notes (optional `?categoryId=<uuid>`) |
| `GET` | `/api/notes/archived` | List archived notes |
| `GET` | `/api/notes/:id` | Get note by ID |
| `POST` | `/api/notes` | Create a note |
| `PUT` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note (returns 204) |
| `PATCH` | `/api/notes/:id/archive` | Archive a note |
| `PATCH` | `/api/notes/:id/unarchive` | Unarchive a note |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | List all categories |
| `POST` | `/api/categories` | Create a category |
| `DELETE` | `/api/categories/:id` | Delete a category (returns 204) |
