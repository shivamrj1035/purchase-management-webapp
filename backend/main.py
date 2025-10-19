from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sys

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Housing Management API",
    version="1.0.0",
    description="API for managing home buying financial journey",
    docs_url="/docs" if os.getenv("DEBUG") == "True" else None,
    redoc_url="/redoc" if os.getenv("DEBUG") == "True" else None,
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
try:
    from routers.users import router as users_router
    app.include_router(users_router, prefix="/api")
    print("✅ Auth routes loaded")
except Exception as e:
    print(f"⚠️ Could not load auth routes: {e}")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Housing Management API",
        "status": "running",
        "version": "1.0.0"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Housing Management API"
    }

# API info endpoint
@app.get("/api/info")
async def api_info():
    return {
        "name": "Housing Management API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "auth_me": "/api/auth/me",
            "auth_verify": "/api/auth/verify-token",
            "auth_status": "/api/auth/status",
        },
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
