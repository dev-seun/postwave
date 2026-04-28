from contextlib import asynccontextmanager
import json

from .cron_worker import get_post_stats, start_scheduler
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routes import router 


@asynccontextmanager
async def lifespan(app: FastAPI): 
    # 1. Initialize Database
    init_db()
    
    # 2. Start the Scheduler
    start_scheduler()
    
    # 3. Optional: Print routes for debugging
    print("\nAvailable routes:")
    for route in app.routes:
        if hasattr(route, 'methods'):
            methods = ','.join(route.methods)
            print(f"{methods:10} {route.path}")
            
    yield 
    
app = FastAPI(lifespan=lifespan)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
    
@app.get("/health")
def get_health(): # type: ignore
    return {"message": "API is running"}
 
    
# app.prefix("/api")  # Optional: add /api prefix to all routes
app.include_router(router)
