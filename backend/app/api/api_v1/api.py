from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, children

# Create main API router
api_router = APIRouter()

# Include sub-routers for different endpoint groups
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(children.router, prefix="/children", tags=["children"])

# Additional routers will be added in later phases (sessions, quizzes, etc.)
