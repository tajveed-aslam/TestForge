from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routers import generate, docs

app = FastAPI(title="TestForge API", version="1.0.0")

# Comma-separated list, e.g. "http://localhost:3000,https://testforge.vercel.app"
_frontend_origins = os.getenv("FRONTEND_ORIGINS") or os.getenv("FRONTEND_URL", "http://localhost:3000")
cors_origins = [o.strip() for o in _frontend_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router)
app.include_router(docs.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "TestForge API"}
