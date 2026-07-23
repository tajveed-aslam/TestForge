# TestForge

An AI-powered tool that generates production-ready test automation code and
SDLC documentation from a plain-English feature description. Supports 10
test frameworks across 5 languages, 3 code patterns, and 8 professional
document types. Output streams in real time over SSE.

- **Test Code Generator** (`/generate`) — describe a feature, pick a
  framework/test type/pattern, get a complete, runnable test file.
- **SDLC Doc Generator** (`/docs`) — describe a project, pick a document
  type, get a professional Markdown document (Test Strategy, Test Plan,
  RTM, User Stories, Bug Reports, Release Notes, Sprint Planning, API Docs).

## Stack

- **Backend**: FastAPI + Gemini API (`google-genai`), streamed via SSE
- **Frontend**: Next.js 16 (App Router) + Tailwind CSS
- **Tests**: pytest (backend, mocked AI calls) + Playwright (API + UI, `tests/`)

## Project layout

```
backend/    FastAPI service — routers, prompt building, Gemini integration
frontend/   Next.js app — the two generator pages
tests/      Playwright suite — API + UI, run against a live instance
```

## Running locally

### Backend

```bash
cd backend
python -m venv venv && source venv/Scripts/activate  # or venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

By default `.env.example` sets `MOCK_MODE=true`, which streams pre-written
sample responses — no API key needed, useful for demos or running the test
suite without burning API quota. Set `MOCK_MODE=false` and a real
`GEMINI_API_KEY` (free tier: aistudio.google.com/apikey) to call the live
Gemini API.

### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

`NEXT_PUBLIC_API_URL` is inlined at **build time** — it must be set before
`npm run build` runs, not just at runtime, or a deployed frontend will try
to call `localhost:8000` from the browser.

### Tests

```bash
cd tests
npm install
npx playwright install chromium
cp .env.example .env   # FRONTEND_URL / API_URL — defaults match local dev
npx playwright test
```

The suite runs against a live backend + frontend instance (start both
first, with the backend in `MOCK_MODE=true`) rather than mocking the network
itself. It runs with a single worker deliberately — it's testing one shared
dev-server instance, and full parallelism causes contention against
Turbopack's on-demand route compilation.

Backend unit/integration tests don't need a live server:

```bash
cd backend
pytest
```

## Deploying

- **Backend → Render**: root directory `backend`, build command
  `pip install -r requirements.txt`, start command
  `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set `GEMINI_API_KEY`,
  `MOCK_MODE=false` (or leave `true` for a zero-cost live demo), and
  `FRONTEND_ORIGINS` to your deployed frontend's URL.
- **Frontend → Vercel**: root directory `frontend`. Set
  `NEXT_PUBLIC_API_URL` to your Render backend's URL before the first build.
