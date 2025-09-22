# Supply & Logistics Strategy — React Frontend

This is a React rewrite of the vanilla HTML wizard. It talks to the **same FastAPI backend**.

## Run locally

```bash
npm install
npm run dev
# open the URL printed by Vite (e.g., http://localhost:5173)
```

## Configure backend & login

- Set API base (default: `http://localhost:8000`) in the sidebar and click **Save**.
- Type your email and click **Login** (maps to `POST /auth/login` in FastAPI).

## Implemented pages
- Programme – Basics
- Materials (CSV import, gap calculation)
- Procurement (with modality/source guard)
- Map (Leaflet)
- Summary (KPIs)

State is kept in localStorage and (debounced) persisted to the backend as a single `Strategy.data` blob.
