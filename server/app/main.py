from fastapi import FastAPI
from .routes import users, auth, blogs, posts
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app (auto-generates OpenAPI docs at /docs)
app = FastAPI()

# Create database tables from model definitions (Optional: Alembic handles migrations, but this ensures tables exist for dev/testing)
# models.Base.metadata.create_all(bind=engine)

# Include routers to modularize endpoints by domain
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(blogs.router)
app.include_router(posts.router)


@app.get("/", tags=["Health Check"])
def read_root():
    """Root endpoint - health check or API info"""
    return {"status": "healthy"}


origins = ["http://localhost:5173", "https://ink-app.duckdns.org"]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # In production, specify the exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
