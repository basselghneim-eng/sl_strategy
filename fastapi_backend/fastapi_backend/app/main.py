from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db
from .config import settings
from .routers import auth as auth_router
from .routers import strategies as strategies_router

init_db()
app = FastAPI(title="Supply & Logistics Strategy API", version="1.0.0")

origins = [o.strip() for o in (settings.BACKEND_CORS_ORIGINS or "").split(",") if o.strip()] or ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth_router.router)
app.include_router(strategies_router.router)

@app.get("/healthz")
def healthz(): return {"status":"ok"}
