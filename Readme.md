# EV Charging Session Service

A **Node.js** REST API for managing **electric-vehicle charging sessions**: start a session at a station, record energy readings while it is active, then stop the session and receive a **charge detail record (CDR)** with costs derived from a simple tariff model. The service persists state in **MongoDB** and exposes **OpenAPI** documentation and validated request/response contracts.

---

## How the application works

1. **Start session** (`POST /api/v1/session`)  
   Creates a new session with a generated `sessionId`, links it to `userId` and `stationId`, sets status to **ACTIVE**, and initializes empty `energyLogs`. Optional header **`Idempotency-Key`** ensures duplicate starts return the same session (stored in an `idempotency` collection).

2. **Update session** (`PATCH /api/v1/session/:id`)  
   While the session is **ACTIVE**, clients append **energy** samples to `energyLogs` (value + timestamp). If the session is not active, the API responds with a domain error.

3. **Stop session** (`POST /api/v1/session/:id/stop`)  
   - Atomically finds an **ACTIVE** session (with no CDR yet) and marks it **STOPPED**.  
   - Computes totals: energy from summed logs, duration from `createdAt` to now.  
   - **Tariff** (`DEFAULT_TARIFF` in domain constants): `energyCost = energy × energyRate`, `timeCost = duration(minutes) × timeRate`, `totalCost` = sum.  
   - Persists the CDR and final **COMPLETED** status inside a **MongoDB transaction**.  
   - **`Idempotency-Key`** on stop returns the same CDR for retries.

Supporting behavior:

- **Health**: `fastify-healthcheck` for liveness-style checks.  
- **Logging**: Request/response hooks attach trace context; **Pino** is used for structured logs.  
- **Errors**: Central Fastify error handler maps domain and validation errors to HTTP responses.  
- **Swagger UI**: Served under **`/docs`** with OpenAPI metadata from `@fastify/swagger`.

```mermaid
flowchart LR
  A[POST /session] --> B[ACTIVE session]
  B --> C[PATCH energy logs]
  C --> B
  B --> D[POST .../stop]
  D --> E[CDR + COMPLETED]
```

---

## Architecture and approach

The codebase follows a **layered, ports-and-adapters style** layout so HTTP and persistence can change without rewriting business rules:

| Layer | Role |
|--------|------|
| **`interfaces/`** | Routes, controllers, and **JSON Schema** for Fastify (request/response validation via **AJV**). |
| **`application/`** | **Use cases** orchestrate repositories and domain services; no direct HTTP types. |
| **`domain/`** | **Entities** (session shape), **constants** (status, tariff), and **TariffService** (pure cost calculation). |
| **`infrastructure/`** | **MongoDB** plugin (client, indexes, collections), **repositories**, **idempotency** plugin, **AJV** and **Swagger** plugins, logging hooks. |
| **`shared/`** | Env schema, errors, logging helpers, cross-cutting utilities. |

**Design choices:**

- **Use-case functions** receive `fastify` (for config, mongo, log) and return async handlers—simple composition without a heavy DI framework.  
- **Repositories** encapsulate MongoDB calls (`insertOne`, `findOne`, `findOneAndUpdate`, `updateOne`) and log queries for observability.  
- **Idempotency** uses a unique index on `(idempotencyKey, type)` with duplicate-key handling for races on start/stop.  
- **Validation**: Route-level JSON Schema + AJV (keywords, formats, custom error messages) keeps contracts explicit and aligns with OpenAPI generation.  
- **Environment**: `@fastify/env` loads and validates `process.env` against a single schema (`shared/schemas/env-schema.js`).

---

## Main packages

| Package | Purpose |
|---------|---------|
| **fastify** | HTTP server, plugins, lifecycle. |
| **@fastify/env** | Typed config from environment variables. |
| **@fastify/cors** | CORS (includes `idempotency-key` header). |
| **@fastify/swagger** / **@fastify/swagger-ui** | OpenAPI spec and `/docs` UI. |
| **fastify-healthcheck** | Health endpoint. |
| **fastify-plugin** | Encapsulated plugins with proper encapsulation. |
| **mongodb** | Official driver; sessions + idempotency collections, transactions on stop. |
| **ajv**, **ajv-errors**, **ajv-formats**, **ajv-keywords** | Compile-time validation for route schemas. |
| **pino** | Structured logging (used via Fastify logger). |
| **http-status-codes** | Consistent status constants in controllers. |
| **uuid** / **node:crypto** | Session IDs (`randomUUID`). |
| **dotenv** | Load `.env` in development. |

**Development:** ESLint, Prettier, nodemon, pino-pretty (see `package.json` scripts).

---

## Configuration

Variables are validated at startup (`@fastify/env`). Common ones:

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (default `3000`). |
| `HOST` | Bind address (default `0.0.0.0`). |
| `NODE_ENV` | `development` \| `production` \| `local` (default `local`). |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error`. |
| `DATABASE_URL` | MongoDB connection string (default local `mongodb://127.0.0.1:27017/ev_charging`). |
| `MONGO_DIRECT_CONNECTION` | `true` / `false` — when unset, single-host localhost URIs use `directConnection` to avoid replica-set hostname issues in Docker. |

---

## Prerequisites

- **Node.js** (ES modules; project uses `"type": "module"`).  
- **MongoDB** reachable at `DATABASE_URL`.

---

## Run locally

```bash
npm install
# Set DATABASE_URL and other vars, or rely on defaults
npm run start
```

Development with reload and pretty logs:

```bash
npm run start:dev
```

**Quality gate (lint + format check):**

```bash
npm run build
```

---

## Docker

```bash
docker build -t ev-charging-session-service .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="mongodb://host.docker.internal:27017/ev_charging" \
  ev-charging-session-service
```

Adjust `DATABASE_URL` for your network. The image runs `node` with an increased HTTP header size limit (same as `npm start`).

---

## API surface

Base path: **`/api/v1`**

| Method | Path | Summary |
|--------|------|---------|
| `POST` | `/session` | Start a charging session. |
| `PATCH` | `/session/:id` | Append energy reading for an active session. |
| `POST` | `/session/:id/stop` | Stop session and return CDR (costs + totals). |

- **Interactive contract**: [http://localhost:3000/docs](http://localhost:3000/docs) (when the server is running).  
- **Postman**: Import `postman/EV-CHARGING.postman_collection.json` for runnable examples.

---

## License

ISC (see `package.json`).
