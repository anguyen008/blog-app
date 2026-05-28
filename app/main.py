from fastapi import FastAPI

from . import models
from .routes import users, auth, blogs
from .database import engine

# Initialize FastAPI app (auto-generates OpenAPI docs at /docs)
app = FastAPI()

# Create database tables from model definitions
models.Base.metadata.create_all(bind=engine)

# Include routers to modularize endpoints by domain
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(blogs.router)


@app.get("/")
def read_root():
    """Root endpoint - health check or API info"""
    return {"message": "Hello, World!"}
