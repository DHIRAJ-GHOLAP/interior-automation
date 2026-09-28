import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False) # e.g. "ABC Interiors", "Studio Luxe Design"
    subdomain = Column(String(100), unique=True, index=True, nullable=True)
    company_phone = Column(String(50), nullable=True)
    company_email = Column(String(120), nullable=True)
    gst_number = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), default="Mumbai")
    bank_name = Column(String(100), nullable=True)
    bank_account_no = Column(String(50), nullable=True)
    bank_ifsc = Column(String(50), nullable=True)
    upi_id = Column(String(50), nullable=True)
    logo_url = Column(String(255), nullable=True)
    plan = Column(String(50), default="PRO") # STARTER, PRO, ENTERPRISE
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    clients = relationship("Client", back_populates="tenant", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="tenant", cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="tenant", cascade="all, delete-orphan")
    quotations = relationship("Quotation", back_populates="tenant", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(50), default="ADMIN") # ADMIN, DESIGNER, ESTIMATOR, VIEWER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login_at = Column(DateTime, nullable=True)

    tenant = relationship("Tenant", back_populates="users")

class Client(Base):
    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True, index=True, default="tenant-abc-interiors")
    name = Column(String(120), nullable=False, index=True)
    phone = Column(String(30), nullable=False, index=True)
    whatsapp = Column(String(30), nullable=True)
    email = Column(String(120), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), default="Mumbai")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    tenant = relationship("Tenant", back_populates="clients")
    projects = relationship("Project", back_populates="client", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="client", cascade="all, delete-orphan")
    whatsapp_logs = relationship("WhatsAppLog", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True, index=True, default="tenant-abc-interiors")
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    property_type = Column(String(50), default="2BHK") # 1BHK, 2BHK, 3BHK, Villa, Office, Commercial
    location = Column(String(150), nullable=True)
    carpet_area = Column(Float, default=0.0) # in sq.ft
    number_of_rooms = Column(Integer, default=3)
    start_date = Column(String(30), nullable=True)
    expected_completion = Column(String(30), nullable=True)
    status = Column(String(50), default="New") 
    estimated_budget = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tenant = relationship("Tenant", back_populates="projects")
    client = relationship("Client", back_populates="projects")
    rooms = relationship("Room", back_populates="project", cascade="all, delete-orphan")
    quotations = relationship("Quotation", back_populates="project", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False) # Living Room, Kitchen, Bedroom 1, Master Bedroom, etc.
    floor = Column(String(50), default="Ground Floor")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="rooms")
    measurements = relationship("Measurement", back_populates="room", cascade="all, delete-orphan")
    boq_items = relationship("BOQItem", back_populates="room", cascade="all, delete-orphan")

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(36), ForeignKey("rooms.id"), nullable=False, index=True)
    label = Column(String(100), nullable=False) # e.g. "Wall A", "TV Unit Niche", "Ceiling Drop"
    height = Column(Float, default=0.0) # ft or inches depending on unit
    width = Column(Float, default=0.0)
    length = Column(Float, default=0.0)
    unit = Column(String(20), default="FT") # FT, INCH, METER
    calculated_sqft = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    room = relationship("Room", back_populates="measurements")

class Material(Base):
    __tablename__ = "materials"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True, index=True, default="tenant-abc-interiors")
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True) # Plywood, Laminate, Hardware, Glass, Acrylic, Paint, Electrical, etc.
    brand = Column(String(100), nullable=True) # Century, Greenlam, Hettich, Hafele, Asian Paints, etc.
    material_type = Column(String(100), nullable=True) # BWP, MR, HDHMR, Acrylic High Gloss, etc.
    grade = Column(String(50), nullable=True) # 710, 303, etc.
    thickness = Column(String(30), nullable=True) # 18mm, 12mm, 1mm, etc.
    unit = Column(String(30), default="SQFT") # SQFT, RUNNING_FT, SQM, PIECE, UNIT, SET, LOT, CUSTOM
    purchase_cost = Column(Float, default=0.0) # Cost for interior firm (PRIVATE)
    client_rate = Column(Float, default=0.0)   # Selling rate charged to client (PUBLIC)
    default_wastage_percent = Column(Float, default=10.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tenant = relationship("Tenant", back_populates="materials")

class BOQItem(Base):
    __tablename__ = "boq_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(36), ForeignKey("rooms.id"), nullable=False, index=True)
    material_id = Column(String(36), ForeignKey("materials.id"), nullable=True)
    item_title = Column(String(150), nullable=False) # e.g. "Base Cabinets (Plywood 18mm BWP)"
    category = Column(String(100), default="Cabinetry")
    calculation_type = Column(String(30), default="AREA") # AREA, RUNNING_FT, PIECES, FIXED
    
    # Raw dimensions if applicable
    height = Column(Float, default=0.0)
    width = Column(Float, default=0.0)
    length = Column(Float, default=0.0)
    multiplier = Column(Float, default=1.0)
    
    net_quantity = Column(Float, default=0.0)
    unit = Column(String(30), default="SQFT")
    wastage_percent = Column(Float, default=10.0)
    chargeable_quantity = Column(Float, default=0.0) # net_quantity * (1 + wastage_percent/100)
    
    # Financials
    purchase_rate = Column(Float, default=0.0) # Private
    client_rate = Column(Float, default=0.0)   # Public
    total_cost = Column(Float, default=0.0)    # chargeable_quantity * purchase_rate
    total_amount = Column(Float, default=0.0)  # chargeable_quantity * client_rate
    gross_margin = Column(Float, default=0.0)  # total_amount - total_cost

    room = relationship("Room", back_populates="boq_items")
    material = relationship("Material")

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True, index=True, default="tenant-abc-interiors")
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    quotation_number = Column(String(50), nullable=False, unique=True, index=True) # INT-2026-0047, INT-2026-0047-R1
    version = Column(String(20), default="R0") # Original, R1, R2, FINAL
    parent_quotation_id = Column(String(36), ForeignKey("quotations.id"), nullable=True)
    status = Column(String(50), default="Draft", index=True) # Draft, Sent, Viewed, Responded, Negotiation, Accepted, Rejected
    
    subtotal = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    tax_percent = Column(Float, default=18.0) # GST 18% standard in India
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    
    # Internal financials (hidden from client)
    total_cost = Column(Float, default=0.0)
    gross_margin = Column(Float, default=0.0)
    margin_percent = Column(Float, default=0.0)
    
    valid_until = Column(String(30), nullable=True)
    public_token = Column(String(64), unique=True, index=True, default=generate_uuid) # for quote.domain/q/<token>
    notes = Column(Text, nullable=True)
    terms = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sent_at = Column(DateTime, nullable=True)

    tenant = relationship("Tenant", back_populates="quotations")
    project = relationship("Project", back_populates="quotations")
    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="quotation", cascade="all, delete-orphan")
    responses = relationship("ClientResponse", back_populates="quotation", cascade="all, delete-orphan")

class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    quotation_id = Column(String(36), ForeignKey("quotations.id"), nullable=False, index=True)
    room_name = Column(String(100), nullable=False) # e.g. Kitchen, Living Room
    item_title = Column(String(150), nullable=False)
    material_spec = Column(String(250), nullable=True) # e.g. "Century 18mm BWP 710 Plywood + 1mm Merino Laminate"
    quantity = Column(Float, default=0.0)
    unit = Column(String(30), default="SQFT")
    rate = Column(Float, default=0.0)
    amount = Column(Float, default=0.0)
    
    # Internal cost (never displayed on client view)
    unit_cost = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)

    quotation = relationship("Quotation", back_populates="items")

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    quotation_id = Column(String(36), ForeignKey("quotations.id"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False, index=True)
    step_number = Column(Integer, default=1) # 1 (+2 days), 2 (+3 days), 3 (+5 days)
    scheduled_for = Column(DateTime, nullable=False, index=True)
    status = Column(String(30), default="Pending", index=True) # Pending, Sent, Cancelled, Skipped
    channel = Column(String(30), default="WhatsApp") # WhatsApp, Email, Call
    message_content = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    quotation = relationship("Quotation", back_populates="followups")
    client = relationship("Client", back_populates="followups")

class ClientResponse(Base):
    __tablename__ = "client_responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    quotation_id = Column(String(36), ForeignKey("quotations.id"), nullable=False, index=True)
    response_type = Column(String(50), nullable=False) # Interested, Need Changes, Need More Time, Not Interested, Custom Message
    comments = Column(Text, nullable=True)
    sentiment = Column(String(30), default="Positive") # Positive, Neutral, Negative, Negotiation
    detected_intent = Column(String(50), default="General Interest") # e.g. Negotiation, Scope Revision, Schedule Meeting
    responded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    quotation = relationship("Quotation", back_populates="responses")

class WhatsAppLog(Base):
    __tablename__ = "whatsapp_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    quotation_id = Column(String(36), ForeignKey("quotations.id"), nullable=True)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False, index=True)
    recipient_phone = Column(String(30), nullable=False)
    message_type = Column(String(50), default="Quotation") # Quotation, FollowUp_1, FollowUp_2, Custom
    message_body = Column(Text, nullable=False)
    status = Column(String(30), default="Sent") # Sent, Delivered, Read, Failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
