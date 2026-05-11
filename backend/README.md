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

## SVD training + tuning API

The data scientist role can train SVD on `backend/dataset/BX-Book-Ratings.csv`:

```bash
# 1) Login as data scientist
TOKEN=$(curl -s -X POST "http://127.0.0.1:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"datasci@example.com","password":"password123"}' | python -c "import json,sys; print(json.load(sys.stdin)['access_token'])")

# 2) Train SVD with hyperparameter tuning
curl -X POST "http://127.0.0.1:8000/api/v1/ml/train" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "max_ratings": 30000,
    "test_ratio": 0.2,
    "random_seed": 42,
    "min_user_ratings": 2,
    "min_book_ratings": 2,
    "enable_tuning": true,
    "max_trials": 6,
    "hyperparameters": { "factors": 80, "epochs": 10, "learning_rate": 0.01, "regularization": 0.05 },
    "tuning_space": {
      "factors": [50, 80, 120],
      "epochs": [8, 10],
      "learning_rates": [0.005, 0.01],
      "regularizations": [0.02, 0.05]
    }
  }'
```

## Seeded accounts

- `alex.johnson@example.com` / `password123` (user)
- `admin@example.com` / `password123` (admin)
- `datasci@example.com` / `password123` (data_scientist)

## Run tests

```bash
pytest -q
```
