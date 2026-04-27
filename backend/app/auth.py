from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
import os  
from dotenv import load_dotenv
from jose import jwt, jwk

load_dotenv()  # Load environment variables from .env file

CLERK_ISSUER = os.getenv("CLERK_ISSUER", "https://api.clerk.dev/v1")
CLERK_JWT_PUBLIC_KEY = os.getenv("CLERK_JWT_PUBLIC_KEY")  # Optional: for local validation

security = HTTPBearer()

# def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
#     print(f"Received token: {credentials.credentials}")
#     token = credentials.credentials
#     print(f"Verifying token with Clerk: {token}")
#     # Option 1: Validate with Clerk API
#     resp = requests.get(f"{CLERK_ISSUER}/v1/client/sessions/me", headers={"Authorization": f"Bearer {token}"})
#     if resp.status_code != 200:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Clerk token")
#     print(f"Clerk API response: {resp.json()}")
#     return resp.json() 


# CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
# print(f"CLERK_SECRET_KEY: {CLERK_SECRET_KEY}")  # Debug print to check if the secret key is loaded

clerk_issuer = os.getenv("CLERK_ISSUER", '')
clerk_jwks_url = os.getenv("CLERK_JWKS_URL", '')
clerk_secret_key = os.getenv("CLERK_SECRET_KEY", '') 

print(f"CLERK_ISSUER: {clerk_issuer}")
print(f"CLERK_JWKS_URL: {clerk_jwks_url}")
print(f"CLERK_SECRET_KEY: {clerk_secret_key}")  # Debug print to check if the secret key is loaded

def get_jwks():
    response = requests.get(clerk_jwks_url)
    return response.json()

def get_public_key(kid):
    jwks = get_jwks()
    for key in jwks['keys']:
        if key['kid'] == kid:
            return jwk.construct(key)
    raise HTTPException(status_code=401, detail="Invalid token")

def decode_token(token: str):
    headers = jwt.get_unverified_headers(token)
    kid = headers['kid']
    public_key = get_public_key(kid)
    return jwt.decode(token, public_key.to_pem().decode('utf-8'), algorithms=['RS256'], audience="your_audience", issuer=clerk_issuer)


def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # return 'user_3CrQkI6qZYgpdiVfqM31RwG0Ig2'
    token = credentials.credentials
    print(f"Verifying token with Clerk: {token}")
    try:
        decoded = decode_token(token)
        print(f"Decoded token: {decoded}")
        user_id = decoded.get('sub')
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        return user_id
    except Exception as e:
        print(f"Token verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Clerk token")

# def test_auth():
#     from fastapi.testclient import TestClient
#     from .main import app

#     client = TestClient(app)
#     response = client.get(
#         "/auth-test",
#         headers={"Authorization": "Bearer YOUR_TEST_TOKEN"}
#     )
#     print(response.status_code, response.json())