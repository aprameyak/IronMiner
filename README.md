# IronMiner

IronMiner is a construction site dashboard for superintendents. It turns site walkthrough footage into zone-by-zone safety violations, congestion scores, and short written briefings, and adds live worker video, alerts, and crew assignment. It was built as a team project at the UMD x IronSite 2026 hackathon and is a prototype, not a production system.

## Features

- Safety Agent (`app/agents/safety_agent.py`): rule checks based on OSHA 29 CFR 1926 for PPE, fall protection, crane loads, hot work, blocked egress, and trade proximity. Detection is deterministic Python; an LLM only writes the summary.
- Productivity Agent (`app/agents/productivity_agent.py`): scores congestion 1 to 5 per zone from worker density and trade count, flags trade overlaps, and generates rule-based suggestions plus an LLM-written briefing.
- Team planner (`app/agents/team_planner_agent.py`): asks Claude to propose assignments of unassigned workers to teams, returned as JSON.
- Live mode: LiveKit tokens and rooms for manager and worker video, WebSocket channels for alerts and pipeline progress, a browser worker simulator at `/worker`, and an Android headset client in `headset-client/`.
- React dashboard with Review, Live, Teams, and Crew views and a 3D zone layout built with three.js.

## Current limitations

- The Video Agent does not analyze uploaded video. It returns zone data from a matching JSON file in `demo_assets/` if one exists, otherwise a fixed set of five hand-written zones based on a cached Twelve Labs Pegasus summary (`app/summarizer/summary.txt`). The upload is only used to cut thumbnail chunks.
- Vast.ai GPU inference (`app/services/vastai_client.py`, `scripts/remote_inference.py`) is not wired into the upload pipeline.
- Team benchmark evaluation uses embedding similarity if `sentence-transformers` is installed, and otherwise falls back to keyword (Jaccard) overlap in `app/agents/keyword_evaluator.py`.
- The frontend falls back to mock data in `gui/src/utils/mockData.ts` when API calls fail, and several components read from it directly.
- Single-frame safety analysis and live feed scanning return HTTP 501.
- Without Supabase, data is held in memory and lost on restart.
- `app/services/storage.py` and the tests import `app/data/mock_video_results.py`, which is excluded by `.gitignore` and is not in the repository. The backend and tests will not start from a fresh clone until that module is restored.

## Tech stack

- Backend: Python 3.11, FastAPI, WebSockets, Pydantic
- LLM: Ollama (default) or the Claude API for summaries; Claude for team planning
- Frontend: React 18, TypeScript, Vite, three.js via react-three-fiber, dnd-kit
- Realtime video: LiveKit (server in Docker, client SDKs in web and Android)
- Storage: Supabase (optional) with in-memory fallback
- Android headset client: Kotlin, LiveKit Android SDK

## Getting started

Prerequisites: Python 3.11, Node 20, Docker, and either Ollama or an Anthropic API key.

Environment variables are listed in `.env.example` (backend) and `gui/.env.example` (frontend). Copy them to `.env` and `gui/.env`.

- Backend: `ANTHROPIC_API_KEY`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_HOST`, `LIVEKIT_PUBLIC_WS_URL`, `LLM_PROVIDER`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `SUPABASE_URL`, `SUPABASE_KEY`, `VASTAI_API_KEY`, `VASTAI_BASE_URL`, `VASTAI_INSTANCE_ID`, `VASTAI_MODEL_ID`
- Frontend: `VITE_API_URL`, `VITE_LIVEKIT_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`

Install:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd gui && npm install
```

`requirements.txt` does not list every package the code imports. Depending on which features you use you may also need `anthropic`, `supabase`, `av`, `numpy`, `pytest`, and for the optional paths `tenacity`, `vastai-sdk`, and `sentence-transformers`.

Run everything (LiveKit, Redis, and Ollama via `docker-compose.yml`, then the backend on port 8000 and Vite on port 5173):

```bash
./scripts/dev.sh
```

Or run the pieces yourself:

```bash
docker-compose up -d
uvicorn app.main:app --reload --port 8000
cd gui && npm run dev
```

API docs are served at `http://localhost:8000/docs`.

Tests (deterministic Safety Agent rule checks, no network or LLM):

```bash
pytest app/tests
```

## Usage

With the backend on port 8000, upload a walkthrough video. The response is a `VideoJob`; the Video, Safety, and Productivity agents then run in the background.

```bash
curl -F "file=@site_walkthrough.mp4" -F "site_id=s1" http://localhost:8000/api/video/upload
```

Naming the file `site_walkthrough.mp4` makes the Video Agent load `demo_assets/site_walkthrough.json`. Then read the reports for that site:

```bash
curl http://localhost:8000/api/safety/report/s1
curl "http://localhost:8000/api/safety/report/s1/violations?severity=high"
curl http://localhost:8000/api/productivity/report/s1/zones
```

Ask Claude to fill empty teams for a site (requires `ANTHROPIC_API_KEY`):

```bash
curl -X POST "http://localhost:8000/api/teams/auto-assign?site_id=s1"
```

In the browser, open `http://localhost:5173` for the dashboard and `http://localhost:5173/worker` for the worker simulator.

## How it works

1. `POST /api/video/upload` (`app/routers/video.py`) saves the file and runs the Video Agent, which produces a `VideoProcessingResult` of zones, workers, PPE, hazards, and egress paths (see Current limitations for where that data comes from).
2. The Safety and Productivity agents run on that result. Each does its analysis in plain Python, then calls `app/services/llm_client.py` (Ollama CLI or Claude, chosen by `LLM_PROVIDER`) for a short summary. If the LLM call fails, a templated summary is used.
3. Progress and alerts are pushed to the dashboard over WebSockets (`app/ws/manager.py`, `app/routers/streaming.py`).
4. `app/services/db.py` reads and writes Supabase when configured and falls back to in-memory dicts in `app/services/storage.py`. Workers and teams persist to JSON files under `data/` (`app/services/team_service.py`).
5. `app/services/livekit_service.py` issues LiveKit access tokens for managers and workers.

## Project structure

```
app/
  agents/        video, safety, productivity, team planner, evaluators
  routers/       sites, video, safety, productivity, alerts, streaming, workers, teams
  services/      LLM clients, LiveKit, Supabase, storage, Vast.ai, job queue
  models/        Pydantic schemas
  summarizer/    Twelve Labs Pegasus script and cached summary
  tests/         pytest tests for the Safety Agent
gui/src/
  views/         Review, Live, Teams, Crew, WorkerSimulator
  components/    panels, BIM zone view, team board, live stream grid
  api/           backend client functions
headset-client/  Android app that streams a worker's camera to LiveKit
demo_assets/     canned zone JSON for demo uploads
scripts/         dev.sh, Supabase seeding, remote inference
```

## Contributing

Issues and pull requests are welcome. Before opening a PR, run `pytest app/tests` and `npm run build` in `gui/`. CI (`.github/workflows/ci.yml`) installs `requirements.txt` and builds the frontend.

## License

MIT, see [LICENSE](LICENSE).
