# Book Recommendation FastAPI Backend

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API root: `http://127.0.0.1:8000/api/v1`
Swagger UI: `http://127.0.0.1:8000/docs`
OpenAPI JSON: `http://127.0.0.1:8000/api/v1/openapi.json`

## Seeded accounts

- `alex.johnson@example.com` / `password123` (user)
- `admin@example.com` / `password123` (admin)
- `datasci@example.com` / `password123` (data_scientist)

## Run tests

```bash
pytest -q
```
