from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import User, Tenant
from ..services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_tenant
)

router = APIRouter(prefix="/api/auth", tags=["Authentication & Tenants"])

class RegisterRequest(BaseModel):
    company_name: str
    full_name: str
    email: str
    password: str
    phone: Optional[str] = None
    city: Optional[str] = "Mumbai"

class LoginRequest(BaseModel):
    email: str
    password: str

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    company_phone: Optional[str] = None
    company_email: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    bank_ifsc: Optional[str] = None
    upi_id: Optional[str] = None

@router.post("/register")
def register_studio(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Create new tenant
    tenant = Tenant(
        name=req.company_name,
        company_phone=req.phone,
        company_email=req.email.lower(),
        city=req.city or "Mumbai",
        plan="PRO"
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    # Create admin user
    user = User(
        tenant_id=tenant.id,
        email=req.email.lower(),
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        role="ADMIN"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "tenant_id": tenant.id, "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        },
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "city": tenant.city,
            "plan": tenant.plan
        }
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower(), User.is_active == True).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    tenant = user.tenant
    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id, "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        },
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "city": tenant.city,
            "plan": tenant.plan,
            "company_phone": tenant.company_phone,
            "gst_number": tenant.gst_number,
            "upi_id": tenant.upi_id
        }
    }

@router.get("/me")
def get_current_profile(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        },
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "subdomain": tenant.subdomain,
            "company_phone": tenant.company_phone,
            "company_email": tenant.company_email,
            "gst_number": tenant.gst_number,
            "address": tenant.address,
            "city": tenant.city,
            "bank_name": tenant.bank_name,
            "bank_account_no": tenant.bank_account_no,
            "bank_ifsc": tenant.bank_ifsc,
            "upi_id": tenant.upi_id,
            "plan": tenant.plan
        }
    }

@router.put("/tenant")
def update_tenant_settings(
    req: TenantUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    for field, val in req.dict(exclude_unset=True).items():
        if val is not None:
            setattr(tenant, field, val)
    db.commit()
    db.refresh(tenant)
    return {
        "message": "Tenant settings updated successfully",
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "company_phone": tenant.company_phone,
            "company_email": tenant.company_email,
            "gst_number": tenant.gst_number,
            "address": tenant.address,
            "city": tenant.city,
            "bank_name": tenant.bank_name,
            "bank_account_no": tenant.bank_account_no,
            "bank_ifsc": tenant.bank_ifsc,
            "upi_id": tenant.upi_id
        }
    }
