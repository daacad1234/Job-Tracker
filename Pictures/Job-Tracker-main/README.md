# Job Vacancy Board & Applicant Tracking — Full Stack

Spring Boot (API) · PostgreSQL (database) · React + Tailwind (frontend)
All three run together with Docker Compose — one command, nothing to install
locally except Docker itself.

```
jobboard-fullstack/
├── docker-compose.yml   ← starts postgres + backend + frontend together
├── backend/             ← Spring Boot API (Dockerfile included)
└── frontend/            ← React + Tailwind app (Dockerfile included)
```

## 1. Prerequisite
Docker Desktop (or Docker Engine + Compose plugin) installed and running.
That's it — no local Java, Maven, Node, or Postgres install needed.

## 2. Run everything
From this folder:
```bash
docker compose up --build
```
First run takes a few minutes (Maven downloads dependencies, npm installs
packages, images build). Subsequent runs are fast since layers are cached.

This starts three containers:

| Service    | URL                          | What it is |
|------------|-------------------------------|------------|
| `postgres` | `localhost:5432`              | PostgreSQL 16, database `jobboard_db` |
| `backend`  | `http://localhost:8080/api`   | Spring Boot REST API |
| `frontend` | `http://localhost:5173`       | React app, served by nginx |

The backend waits for Postgres to report healthy before it starts (see the
`depends_on: condition: service_healthy` in `docker-compose.yml`), and
`spring.jpa.hibernate.ddl-auto=update` creates all 6 tables automatically the
first time it connects — no manual schema step.

## 3. Open the app
Go to **http://localhost:5173** — register an account (job seeker or
employer), and you're in. Data you create here lands in the same Postgres
database and API the Postman collection talks to (see below), so anything you
do in one shows up in the other.

## 4. Test the API directly with Postman
Import `backend/jobboard.postman_collection.json`. It's pre-wired to
`http://localhost:8080/api` and auto-saves tokens/IDs as you go:
register employer → register applicant → register admin → create category →
create company → post job → apply → review application. Anything you create
here is immediately visible in the React app at localhost:5173, and vice
versa — same database.

## 5. Stopping / resetting
```bash
docker compose down          # stop containers, keep the Postgres volume (data persists)
docker compose down -v       # stop containers AND wipe the database
```

## 6. Configuration notes
- The backend's `JWT_SECRET` and DB credentials are set as environment
  variables in `docker-compose.yml`, which override the defaults in
  `backend/src/main/resources/application.properties`. Change the default
  `JWT_SECRET` in `docker-compose.yml` (or export a `JWT_SECRET` env var
  before running `docker compose up`) before this ever runs anywhere but
  your own machine.
- CORS is configured for `http://localhost:5173` (where the frontend
  container publishes to). If you change the frontend's port mapping,
  update `APP_CORS_ALLOWED_ORIGINS` in `docker-compose.yml` to match.
- The frontend's API base URL (`http://localhost:8080/api`) is set in
  `frontend/src/services/api.js`. Since both containers publish to
  `localhost` on your machine, the browser reaches the backend the same way
  whether it's dockerized or run with `mvn spring-boot:run` directly.

## Running without Docker
Each service still works standalone — see `backend/README.md` and
`frontend/README.md` for the plain Maven/npm instructions.
