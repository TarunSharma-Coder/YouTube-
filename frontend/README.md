# Frontend

Next.js + TypeScript + Tailwind frontend for the new YouTube Growth Intelligence dashboard.

The first fully connected flow is the Overview/Dashboard channel analysis screen. Other pages are
UI-ready placeholders until their matching FastAPI endpoints are migrated.

Run from the `frontend` folder:

```powershell
npm install
npm run dev
```

The frontend calls:

```text
http://localhost:8000/api/channel-analysis
```

Optional override:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
