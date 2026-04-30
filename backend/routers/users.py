"""
User Authentication Routes
Refactored to support Clerk and Google Sheets architecture.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from auth import get_current_user, optional_auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Request/Response Models
class UserResponse(BaseModel):
    user_id: str
    email: Optional[str] = None
    username: Optional[str] = None
    email_verified: bool = False
    phone_number: Optional[str] = None
    home_address: Optional[str] = None

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information from Clerk token.
    Profile details (phone, address) are managed via Google Sheets API in the frontend.
    """
    try:
        return UserResponse(
            user_id=current_user["user_id"],
            email=current_user.get("email"),
            username=current_user.get("name") or current_user.get("email", "").split("@")[0],
            email_verified=current_user.get("email_verified", False)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-token")
async def verify_user_token(current_user: dict = Depends(get_current_user)):
    """
    Verify if the provided token is valid
    """
    return {
        "valid": True,
        "user_id": current_user["user_id"],
        "email": current_user.get("email")
    }

@router.get("/status")
async def auth_status(current_user: Optional[dict] = Depends(optional_auth)):
    """
    Check authentication status
    """
    if current_user:
        return {
            "authenticated": True,
            "user_id": current_user["user_id"],
            "email": current_user.get("email")
        }
    return {
        "authenticated": False
    }
