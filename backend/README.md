# Book Recommendation FastAPI Backend

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Download dataset files once (if missing)
mkdir -p dataset
curl -L "https://raw.githubusercontent.com/bigsnarfdude/guide-to-data-mining/master/BX-Dump/BX-Books.csv" -o dataset/BX-Books.csv
curl -L "https://raw.githubusercontent.com/bigsnarfdude/guide-to-data-mining/master/BX-Dump/BX-Users.csv" -o dataset/BX-Users.csv
curl -L "https://raw.githubusercontent.com/bigsnarfdude/guide-to-data-mining/master/BX-Dump/BX-Book-Ratings.csv" -o dataset/BX-Book-Ratings.csv
uvicorn app.main:app --reload
```

API root: `http://127.0.0.1:8000/api/v1`
Swagger UI: `http://127.0.0.1:8000/docs`
OpenAPI JSON: `http://127.0.0.1:8000/api/v1/openapi.json`

## Dataset-backed seeding

- `seed_data` now loads books from `backend/dataset/BX-Books.csv` instead of hardcoded mock books.
- Optional env vars:
  - `SEED_BOOK_LIMIT` (default `20000`) controls how many books are imported.
  - `SEED_WITH_RATINGS` (default `1`) enables rating aggregation from `BX-Book-Ratings.csv`.

## Seeded accounts

- `alex.johnson@example.com` / `password123` (user)
- `admin@example.com` / `password123` (admin)
- `datasci@example.com` / `password123` (data_scientist)

## Run tests

```bash
pytest -q
```
