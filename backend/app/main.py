from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import advisor, analytics, auth, claims, policies, prior_auth, recommendations, users, ws

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="AI-powered healthcare workflow automation and intelligent insurance advisory platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(policies.router)
app.include_router(recommendations.router)
app.include_router(claims.router)
app.include_router(prior_auth.router)
app.include_router(analytics.router)
app.include_router(advisor.router)
app.include_router(ws.router)


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "InsureSync AI Backend is running successfully!",
        "docs": "/docs",
        "health": "/api/health",
        "frontend": "http://localhost:5173",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": settings.app_name}
