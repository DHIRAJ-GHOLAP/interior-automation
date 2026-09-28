from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Client Schemas
class ClientBase(BaseModel):
    name: str
    phone: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = "Mumbai"
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientOut(ClientBase):
    id: str
    created_at: Optional[datetime] = None
    projects_count: Optional[int] = 0
    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    client_id: str
    name: str
    property_type: Optional[str] = "2BHK"
    location: Optional[str] = None
    carpet_area: Optional[float] = 0.0
    number_of_rooms: Optional[int] = 3
    start_date: Optional[str] = None
    expected_completion: Optional[str] = None
    status: Optional[str] = "New"
    estimated_budget: Optional[float] = 0.0

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: str
    created_at: Optional[datetime] = None
    client_name: Optional[str] = None
    class Config:
        from_attributes = True

# Room Schemas
class RoomBase(BaseModel):
    project_id: str
    name: str
    floor: Optional[str] = "Ground Floor"
    description: Optional[str] = None

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: str
    class Config:
        from_attributes = True

# Measurement Schemas
class MeasurementCreate(BaseModel):
    room_id: str
    label: str
    height: float
    width: float
    length: Optional[float] = 0.0
    unit: Optional[str] = "FT"
    notes: Optional[str] = None

class MeasurementOut(BaseModel):
    id: str
    room_id: str
    label: str
    height: float
    width: float
    length: float
    unit: str
    calculated_sqft: float
    notes: Optional[str] = None
    class Config:
        from_attributes = True

# Material Schemas
class MaterialBase(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None
    material_type: Optional[str] = None
    grade: Optional[str] = None
    thickness: Optional[str] = None
    unit: Optional[str] = "SQFT"
    purchase_cost: float
    client_rate: float
    default_wastage_percent: Optional[float] = 10.0
    in_stock: Optional[bool] = True
    notes: Optional[str] = None

class MaterialCreate(MaterialBase):
    pass

class MaterialOut(MaterialBase):
    id: str
    class Config:
        from_attributes = True

# BOQ Item Schemas
class BOQItemCreate(BaseModel):
    room_id: str
    material_id: Optional[str] = None
    item_title: str
    category: Optional[str] = "Cabinetry"
    calculation_type: Optional[str] = "AREA" # AREA, RUNNING_FT, PIECES, FIXED
    height: Optional[float] = 0.0
    width: Optional[float] = 0.0
    length: Optional[float] = 0.0
    multiplier: Optional[float] = 1.0
    net_quantity: Optional[float] = 0.0
    unit: Optional[str] = "SQFT"
    wastage_percent: Optional[float] = 10.0
    purchase_rate: Optional[float] = 0.0
    client_rate: Optional[float] = 0.0

class BOQItemOut(BaseModel):
    id: str
    room_id: str
    material_id: Optional[str] = None
    item_title: str
    category: str
    calculation_type: str
    height: float
    width: float
    length: float
    multiplier: float
    net_quantity: float
    unit: str
    wastage_percent: float
    chargeable_quantity: float
    purchase_rate: float
    client_rate: float
    total_cost: float
    total_amount: float
    gross_margin: float
    class Config:
        from_attributes = True

# Quotation Schemas
class QuotationCreate(BaseModel):
    project_id: str
    discount_amount: Optional[float] = 0.0
    tax_percent: Optional[float] = 18.0
    notes: Optional[str] = None
    terms: Optional[str] = None
    valid_until: Optional[str] = None

class QuotationItemOut(BaseModel):
    id: str
    room_name: str
    item_title: str
    material_spec: Optional[str] = None
    quantity: float
    unit: str
    rate: float
    amount: float
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None
    class Config:
        from_attributes = True

class QuotationOut(BaseModel):
    id: str
    project_id: str
    quotation_number: str
    version: str
    parent_quotation_id: Optional[str] = None
    status: str
    subtotal: float
    discount_amount: float
    tax_percent: float
    tax_amount: float
    total_amount: float
    total_cost: Optional[float] = 0.0
    gross_margin: Optional[float] = 0.0
    margin_percent: Optional[float] = 0.0
    valid_until: Optional[str] = None
    public_token: str
    notes: Optional[str] = None
    terms: Optional[str] = None
    created_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    items: List[QuotationItemOut] = []
    class Config:
        from_attributes = True

# Client Portal Public View (Strictly without internal cost/margin)
class ClientPortalItemView(BaseModel):
    room_name: str
    item_title: str
    material_spec: Optional[str] = None
    quantity: float
    unit: str
    rate: float
    amount: float

class ClientPortalQuotationView(BaseModel):
    quotation_number: str
    version: str
    client_name: str
    client_city: Optional[str] = None
    project_name: str
    property_type: str
    location: Optional[str] = None
    subtotal: float
    discount_amount: float
    tax_percent: float
    tax_amount: float
    total_amount: float
    valid_until: Optional[str] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    items: List[ClientPortalItemView] = []
    status: str

# Client Response Submission
class ClientResponseSubmit(BaseModel):
    response_type: str # Interested, Need Changes, Need More Time, Not Interested
    comments: Optional[str] = None

# AI Message Analysis
class AIMessageAnalysisRequest(BaseModel):
    message_text: str

class AIMessageAnalysisResponse(BaseModel):
    sentiment: str
    detected_intent: str
    interest_level: str
    suggested_action: str
    summary_for_admin: str
