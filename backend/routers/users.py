"""
User Authentication Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from auth import get_current_user, optional_auth
from firebase_admin import auth, firestore
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Initialize Firestore client
try:
    db = firestore.client()
except Exception as e:
    print(f"⚠️ Firestore initialization failed: {e}")
    db = None

# Request/Response Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str
    phone_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    username: str
    email_verified: bool
    phone_number: Optional[str] = None
    home_address: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserResponse

@router.post("/register", response_model=dict)
async def register_user(user_data: UserRegister):
    """
    Register a new user with Firebase Auth and create Firestore document
    Note: Actual user creation happens on frontend with Firebase Client SDK
    This endpoint creates the Firestore user document
    """
    try:
        # This is a placeholder - actual registration happens on frontend
        # Backend just validates and creates additional data
        return {
            "message": "User registration should be done via Firebase Client SDK on frontend",
            "success": False
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=dict)
async def login_user(credentials: UserLogin):
    """
    Login endpoint - actual authentication happens via Firebase Client SDK
    This is for documentation purposes
    """
    return {
        "message": "Login should be done via Firebase Client SDK on frontend",
        "success": False
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    try:
        user_id = current_user["user_id"]
        
        # Get user data from Firestore
        if db:
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                return UserResponse(
                    user_id=user_id,
                    email=user_data.get("email", current_user["email"]),
                    username=user_data.get("username", ""),
                    email_verified=current_user.get("email_verified", False),
                    phone_number=user_data.get("phoneNumber"),
                    home_address=user_data.get("homeAddress")
                )
        
        # Fallback to token data
        return UserResponse(
            user_id=user_id,
            email=current_user["email"],
            username=current_user.get("name", ""),
            email_verified=current_user.get("email_verified", False),
            phone_number=None,
            home_address=None
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
        "email": current_user["email"]
    }

@router.post("/refresh-token")
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """
    Refresh user token - Frontend handles this via Firebase Client SDK
    """
    return {
        "message": "Token refresh should be done via Firebase Client SDK",
        "user_id": current_user["user_id"]
    }

@router.get("/status")
async def auth_status(current_user: dict = Depends(optional_auth)):
    """
    Check authentication status
    """
    if current_user:
        return {
            "authenticated": True,
            "user_id": current_user["user_id"],
            "email": current_user["email"]
        }
    return {
        "authenticated": False
    }
