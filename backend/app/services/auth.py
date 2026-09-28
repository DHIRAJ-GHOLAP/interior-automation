from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Tenant
from ..config import settings

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_or_create_default_tenant(db: Session) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.id == settings.DEFAULT_TENANT_ID).first()
    if not tenant:
        tenant = Tenant(
            id=settings.DEFAULT_TENANT_ID,
            name="ABC Interiors",
            subdomain="abc-interiors",
            company_phone="9876543210",
            company_email="hello@abcinteriors.com",
            gst_number="27AABCA1234F1Z5",
            address="Level 4, Trade Centre, BKC",
            city="Mumbai",
            bank_name="HDFC Bank",
            bank_account_no="50200012345678",
            bank_ifsc="HDFC0000123",
            upi_id="abcinteriors@hdfcbank",
            plan="PRO",
            is_active=True
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
    return tenant

def get_or_create_default_user(db: Session, tenant: Tenant) -> User:
    user = db.query(User).filter(User.email == "admin@abcinteriors.com").first()
    if not user:
        user = User(
            id="user-default-admin",
            tenant_id=tenant.id,
            email="admin@abcinteriors.com",
            hashed_password=hash_password("admin123"),
            full_name="Rajesh Verma (Founder)",
            role="ADMIN",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts Bearer token. If valid token exists, loads and returns authenticated user.
    If no authorization header provided, defaults to default active workspace user
    to support seamless local usage and demo testing.
    """
    default_tenant = get_or_create_default_tenant(db)

    if auth and auth.credentials:
        payload = decode_access_token(auth.credentials)
        if payload and "sub" in payload:
            user = db.query(User).filter(User.id == payload["sub"], User.is_active == True).first()
            if user:
                return user

    # Default fallback user for frictionless operation
    return get_or_create_default_user(db, default_tenant)

async def get_current_tenant(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    if not tenant:
        return get_or_create_default_tenant(db)
    return tenant
