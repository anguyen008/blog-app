from fastapi import FastAPI
from . import models
from .routes import users, auth, blogs, posts
from .database import engine
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app (auto-generates OpenAPI docs at /docs)
app = FastAPI()

# Create database tables from model definitions
models.Base.metadata.create_all(bind=engine)

# Include routers to modularize endpoints by domain
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(blogs.router)
app.include_router(posts.router)


@app.get("/")
def read_root():
    """Root endpoint - health check or API info"""
    return {"message": "Health Check!"}


origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    " http://localhost:5173",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # In production, specify the exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
