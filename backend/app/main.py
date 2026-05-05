from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router as api_router

from .database import init_db

app = FastAPI(title="Raksha API")

@app.on_event("startup")
def on_startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Raksha API"}

app.include_router(api_router, prefix="/api")
