"""
Authentication Module - Firebase Admin Integration
"""
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials, initialize_app
import os
from functools import wraps

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv("FIREBASE_CERT_URL")
    })
    initialize_app(cred)
    print("✅ Firebase Admin SDK initialized successfully")
except Exception as e:
    print(f"⚠️ Firebase Admin SDK initialization failed: {e}")
    print("ℹ️ Running without Firebase authentication (development mode)")

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verify Firebase ID token from Authorization header
    Returns decoded token with user info
    """
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def get_current_user(token_data: dict = Security(verify_token)):
    """
    Get current authenticated user from token
    """
    return {
        "user_id": token_data.get("uid"),
        "email": token_data.get("email"),
        "email_verified": token_data.get("email_verified", False),
        "name": token_data.get("name", ""),
    }

def optional_auth(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Optional authentication - allows both authenticated and guest access
    Returns user info if authenticated, None if not
    """
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return {
            "user_id": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False),
        }
    except:
        return None
