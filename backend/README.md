# Backend

FastAPI backend for the first migration flow: channel analysis.

Run from the project root:

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```

Available endpoints:

- `GET /api/health`
- `POST /api/channel-analysis`
- `POST /api/comments/analyze`
- `POST /api/insights/competitors`
- `POST /api/insights/outliers`
- `POST /api/insights/trends`
- `POST /api/insights/seasonality`
- `POST /api/insights/search-demand`
- `POST /api/insights/opportunities`
- `POST /api/insights/title/analyze`
- `POST /api/insights/thumbnail/analyze`

The backend reuses the existing Python analysis functions from `app.py`.
