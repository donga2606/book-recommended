# Book Recommendation System (Full Project)

This repository contains:

- `backend/` - FastAPI backend (auth, books, recommendations, admin, ML)
- `Bookrecommendationsystemui/` - React + Vite frontend

Use this guide to run the whole project from scratch.

## 1) Prerequisites

- macOS/Linux shell (commands below use `bash`/`zsh`)
- Python 3.10+ and `pip`
- Node.js 18+ and `npm`

## 2) Clone / enter project

```bash
cd /path/to/figma
```

All commands in this README assume you are at the repository root above.
Run backend and frontend in separate terminals, one by one, as described below.

## 3) Backend setup (FastAPI)

Open terminal A:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Download dataset (required for seeding)

```bash
mkdir -p dataset
curl -L "https://raw.githubusercontent.com/bigsnarfdude/guide-to-data-mining/master/BX-Dump/BX-Books.csv" -o dataset/BX-Books.csv
curl -L "https://raw.githubusercontent.com/bigsnarfdude/guide-to-data-mining/master/BX-Dump/BX-Users.csv" -o dataset/BX-Users.csv
curl -L "https://raw.githubusercontent.com/bigsnarfdude/guide-to-data-mining/master/BX-Dump/BX-Book-Ratings.csv" -o dataset/BX-Book-Ratings.csv
```

### Start backend server

```bash
uvicorn app.main:app --reload
```

Backend URLs:

- API root: `http://127.0.0.1:8000/api/v1`
- Swagger docs: `http://127.0.0.1:8000/docs`
- OpenAPI: `http://127.0.0.1:8000/api/v1/openapi.json`

## 4) Frontend setup (React + Vite)

Open terminal B:

```bash
cd Bookrecommendationsystemui
npm install
```

Optional API base URL (default already points to local backend):

```bash
export VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Start frontend:

```bash
npm run dev
```

Frontend URL (default): `http://127.0.0.1:5173`

## 5) Login accounts (seeded)

- User: `alex.johnson@example.com` / `password123`
- Admin: `admin@example.com` / `password123`
- Data Scientist: `datasci@example.com` / `password123`

## 6) Run tests

From project root:

```bash
PYTHONPATH=backend pytest -q backend/tests
```

Or inside `backend/`:

```bash
pytest -q
```

## 7) Useful notes

- Backend seeds data on startup through app lifespan.
- Dataset folder `backend/dataset/` is intentionally gitignored.
- SQLite DB file may appear at repo root as `backend.db` during local runs.

## 8) Common issues

- **`No books found to seed...`**
  - Ensure dataset CSVs are downloaded to `backend/dataset/`.
- **Frontend cannot load API**
  - Confirm backend is running on `127.0.0.1:8000`.
  - Check `VITE_API_BASE_URL` value if you changed it.
- **Pytest import error (`No module named app`) from root**
  - Run with `PYTHONPATH=backend` as shown above.

