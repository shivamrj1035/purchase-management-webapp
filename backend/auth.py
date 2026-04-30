"""
Authentication Module - Clerk Integration
"""
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import os
import httpx
from jose import jwt
from typing import Optional, Dict, Any
import time

# Clerk Configuration
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE")

# Cache for JWKS
_jwks_cache: Dict[str, Any] = {}
_jwks_last_fetch: float = 0
JWKS_CACHE_TTL = 3600 # 1 hour

async def get_jwks():
    global _jwks_cache, _jwks_last_fetch
    now = time.time()
    if not _jwks_cache or (now - _jwks_last_fetch) > JWKS_CACHE_TTL:
        if not CLERK_JWKS_URL:
            print("⚠️ CLERK_JWKS_URL not set. Authentication will fail unless in development mode.")
            return None
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(CLERK_JWKS_URL)
                response.raise_for_status()
                _jwks_cache = response.json()
                _jwks_last_fetch = now
                print("✅ Clerk JWKS fetched successfully")
        except Exception as e:
            print(f"❌ Failed to fetch Clerk JWKS: {e}")
            return None
    return _jwks_cache

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verify Clerk JWT from Authorization header
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    token = credentials.credentials
    
    # In development mode, if no URL is set, allow mock access
    if not CLERK_JWKS_URL and os.getenv("ENVIRONMENT") == "development":
        print("ℹ️ Using mock authentication for development")
        return {"sub": "mock_user_id", "email": "test@example.com", "name": "Test User", "email_verified": True}

    if not CLERK_JWKS_URL:
        raise HTTPException(status_code=500, detail="Auth configuration missing")

    jwks = await get_jwks()
    if not jwks:
        raise HTTPException(status_code=500, detail="Could not verify authentication (JWKS unavailable)")

    try:
        # Decode and verify the JWT
        # Note: In production, you should validate 'iss' and 'aud'
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            audience=CLERK_AUDIENCE
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTClaimsError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token claims: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def get_current_user(token_data: dict = Security(verify_token)):
    """
    Get current authenticated user from token
    """
    return {
        "user_id": token_data.get("sub"),
        "email": token_data.get("email"),
        "email_verified": token_data.get("email_verified", False),
        "name": token_data.get("name", ""),
    }

async def optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Security(optional_security)):
    """
    Optional authentication - allows both authenticated and guest access
    """
    if not credentials:
        return None
    
    try:
        # Re-use verify_token logic but catch exceptions
        token_data = await verify_token(credentials)
        return await get_current_user(token_data)
    except:
        return None
