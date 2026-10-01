from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta
from ..database import get_db
from ..models import Project, Room, Measurement, BOQItem, Material, Quotation, QuotationItem, Client
from ..schemas import (
    ProjectCreate, ProjectOut, RoomBase, RoomCreate, RoomOut, 
    MeasurementCreate, MeasurementOut, BOQItemCreate, BOQItemOut
)
from ..services.calculation import CalculationEngine

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectOut])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        p_dict = {
            "id": p.id,
            "client_id": p.client_id,
            "name": p.name,
            "property_type": p.property_type,
            "location": p.location,
            "carpet_area": p.carpet_area,
            "number_of_rooms": p.number_of_rooms,
            "start_date": p.start_date,
            "expected_completion": p.expected_completion,
            "status": p.status,
            "estimated_budget": p.estimated_budget,
            "created_at": p.created_at,
            "client_name": p.client.name if p.client else "N/A"
        }
        results.append(ProjectOut(**p_dict))
    return results

@router.post("", response_model=ProjectOut)
def create_project(proj_in: ProjectCreate, db: Session = Depends(get_db)):
    p = Project(**proj_in.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return ProjectOut(
        id=p.id,
        client_id=p.client_id,
        name=p.name,
        property_type=p.property_type,
        location=p.location,
        carpet_area=p.carpet_area,
        number_of_rooms=p.number_of_rooms,
        start_date=p.start_date,
        expected_completion=p.expected_completion,
        status=p.status,
        estimated_budget=p.estimated_budget,
        created_at=p.created_at,
        client_name=p.client.name if p.client else "N/A"
    )

@router.get("/{project_id}")
def get_project_detail(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    rooms_data = []
    total_project_cost = 0.0
    total_project_amount = 0.0

    for r in p.rooms:
        meas_list = [
            {
                "id": m.id,
                "label": m.label,
                "height": m.height,
                "width": m.width,
                "length": m.length,
                "unit": m.unit,
                "calculated_sqft": m.calculated_sqft,
                "notes": m.notes
            } for m in r.measurements
        ]

        boq_list = []
        room_cost = 0.0
        room_amount = 0.0

        for b in r.boq_items:
            room_cost += b.total_cost
            room_amount += b.total_amount
            mat_info = None
            if b.material:
                mat_info = {
                    "id": b.material.id,
                    "name": b.material.name,
                    "category": b.material.category,
                    "brand": b.material.brand,
                    "thickness": b.material.thickness
                }

            boq_list.append({
                "id": b.id,
                "item_title": b.item_title,
                "category": b.category,
                "calculation_type": b.calculation_type,
                "net_quantity": b.net_quantity,
                "wastage_percent": b.wastage_percent,
                "chargeable_quantity": b.chargeable_quantity,
                "unit": b.unit,
                "purchase_rate": b.purchase_rate,
                "client_rate": b.client_rate,
                "total_cost": b.total_cost,
                "total_amount": b.total_amount,
                "gross_margin": b.gross_margin,
                "material": mat_info
            })

        total_project_cost += room_cost
        total_project_amount += room_amount

        rooms_data.append({
            "id": r.id,
            "name": r.name,
            "floor": r.floor,
            "description": r.description,
            "measurements": meas_list,
            "boq_items": boq_list,
            "room_cost": round(room_cost, 2),
            "room_amount": round(room_amount, 2),
            "room_margin": round(room_amount - room_cost, 2)
        })

    quotes_data = [
        {
            "id": q.id,
            "quotation_number": q.quotation_number,
            "version": q.version,
            "status": q.status,
            "subtotal": q.subtotal,
            "discount_amount": q.discount_amount,
            "tax_amount": q.tax_amount,
            "total_amount": q.total_amount,
            "total_cost": q.total_cost,
            "gross_margin": q.gross_margin,
            "margin_percent": q.margin_percent,
            "public_token": q.public_token,
            "created_at": q.created_at,
            "sent_at": q.sent_at
        } for q in p.quotations
    ]

    return {
        "id": p.id,
        "name": p.name,
        "client": {
            "id": p.client.id,
            "name": p.client.name,
            "phone": p.client.phone,
            "city": p.client.city
        } if p.client else None,
        "property_type": p.property_type,
        "location": p.location,
        "carpet_area": p.carpet_area,
        "status": p.status,
        "estimated_budget": p.estimated_budget,
        "rooms": rooms_data,
        "quotations": quotes_data,
        "summary": {
            "total_cost": round(total_project_cost, 2),
            "total_amount": round(total_project_amount, 2),
            "total_margin": round(total_project_amount - total_project_cost, 2),
            "margin_percent": round(((total_project_amount - total_project_cost) / total_project_amount * 100.0), 1) if total_project_amount > 0 else 0
        }
    }

@router.put("/{project_id}")
def update_project(project_id: str, proj_in: ProjectCreate, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    for k, v in proj_in.dict().items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return {"message": "Project updated successfully"}

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    # Clear self-referential parent_quotation_id on quotations belonging to this project
    quote_ids = [q.id for q in p.quotations]
    if quote_ids:
        db.query(Quotation).filter(Quotation.parent_quotation_id.in_(quote_ids)).update(
            {Quotation.parent_quotation_id: None}, synchronize_session=False
        )
        from ..models import WhatsAppLog
        db.query(WhatsAppLog).filter(WhatsAppLog.quotation_id.in_(quote_ids)).update(
            {WhatsAppLog.quotation_id: None}, synchronize_session=False
        )

    db.delete(p)
    db.commit()
    return {"message": "Project deleted successfully", "id": project_id}

# Add room to project
@router.post("/{project_id}/rooms")
def add_room(project_id: str, room_in: RoomBase, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    room = Room(project_id=project_id, name=room_in.name, floor=room_in.floor, description=room_in.description)
    db.add(room)
    db.commit()
    db.refresh(room)
    return {"id": room.id, "name": room.name, "floor": room.floor}

# Add measurement to room
@router.post("/rooms/{room_id}/measurements")
def add_measurement(room_id: str, meas_in: MeasurementCreate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    sqft = CalculationEngine.calculate_dimensions(
        calculation_type="AREA",
        height=meas_in.height,
        width=meas_in.width,
        length=meas_in.length,
        unit=meas_in.unit or "FT"
    )

    measurement = Measurement(
        room_id=room_id,
        label=meas_in.label,
        height=meas_in.height,
        width=meas_in.width,
        length=meas_in.length,
        unit=meas_in.unit or "FT",
        calculated_sqft=sqft,
        notes=meas_in.notes
    )
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement

# Add BOQ item to room
@router.post("/rooms/{room_id}/boq")
def add_boq_item(room_id: str, boq_in: BOQItemCreate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # If material selected, default rates and wastage from material
    purchase_rate = boq_in.purchase_rate
    client_rate = boq_in.client_rate
    wastage_percent = boq_in.wastage_percent
    unit = boq_in.unit

    if boq_in.material_id:
        mat = db.query(Material).filter(Material.id == boq_in.material_id).first()
        if mat:
            if purchase_rate <= 0:
                purchase_rate = mat.purchase_cost
            if client_rate <= 0:
                client_rate = mat.client_rate
            if wastage_percent is None or wastage_percent == 10.0:
                wastage_percent = mat.default_wastage_percent
            if not unit:
                unit = mat.unit

    # Compute net quantity if dimensions were passed
    net_qty = boq_in.net_quantity
    if net_qty <= 0:
        net_qty = CalculationEngine.calculate_dimensions(
            calculation_type=boq_in.calculation_type,
            height=boq_in.height,
            width=boq_in.width,
            length=boq_in.length,
            multiplier=boq_in.multiplier,
            unit=unit
        )

    # Apply wastage
    _, chargeable_qty = CalculationEngine.apply_wastage(net_qty, wastage_percent)

    # Compute costs & margins
    tot_cost, tot_amt, margin, _ = CalculationEngine.calculate_item_financials(
        chargeable_quantity=chargeable_qty,
        purchase_rate=purchase_rate,
        client_rate=client_rate
    )

    boq_item = BOQItem(
        room_id=room_id,
        material_id=boq_in.material_id,
        item_title=boq_in.item_title,
        category=boq_in.category or "Cabinetry",
        calculation_type=boq_in.calculation_type or "AREA",
        height=boq_in.height,
        width=boq_in.width,
        length=boq_in.length,
        multiplier=boq_in.multiplier,
        net_quantity=net_qty,
        unit=unit or "SQFT",
        wastage_percent=wastage_percent,
        chargeable_quantity=chargeable_qty,
        purchase_rate=purchase_rate,
        client_rate=client_rate,
        total_cost=tot_cost,
        total_amount=tot_amt,
        gross_margin=margin
    )
    db.add(boq_item)
    db.commit()
    db.refresh(boq_item)
    return boq_item

# Delete BOQ Item
@router.delete("/boq/{boq_id}")
def delete_boq_item(boq_id: str, db: Session = Depends(get_db)):
    boq = db.query(BOQItem).filter(BOQItem.id == boq_id).first()
    if not boq:
        raise HTTPException(status_code=404, detail="BOQ item not found")
    db.delete(boq)
    db.commit()
    return {"message": "BOQ item deleted"}

# Delete Room
@router.delete("/rooms/{room_id}")
def delete_room(room_id: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    project_id = room.project_id
    db.delete(room)
    db.commit()
    return {"message": "Room deleted", "id": room_id, "project_id": project_id}

# Delete Measurement
@router.delete("/measurements/{meas_id}")
def delete_measurement(meas_id: str, db: Session = Depends(get_db)):
    m = db.query(Measurement).filter(Measurement.id == meas_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Measurement not found")
    db.delete(m)
    db.commit()
    return {"message": "Measurement deleted", "id": meas_id}

# --- Turnkey Construction & Interior Project Templates ---
TEMPLATES_CATALOG = [
    {
        "id": "turnkey_villa",
        "title": "Turnkey G+1 Luxury Villa Construction & Interior",
        "category": "Construction & Interior",
        "property_type": "Villa",
        "description": "End-to-end turnkey EPC: Substructure RCC, AAC blockwork, dual plastering, waterproofing, concealed MEP, Italian marble flooring, and bespoke modular cabinetry.",
        "typical_area": 3450,
        "typical_budget": 7800000,
        "rooms": [
            {
                "name": "Substructure & Civil RCC",
                "floor": "Ground Level",
                "items": [
                    {"title": "RCC M25 Structural Concrete (Footings, Columns & Slabs)", "cat": "Civil & Structural", "calc": "CFT", "qty": 4200, "unit": "CFT", "mat": "Ready Mix Concrete"},
                    {"title": "Tata Tiscon Fe550D TMT Reinforcement Steel", "cat": "Civil & Structural", "calc": "PIECES", "qty": 12500, "unit": "KG", "mat": "Tata Tiscon"}
                ]
            },
            {
                "name": "Masonry, Plaster & Waterproofing",
                "floor": "G+1 Level",
                "items": [
                    {"title": "Siporex 150mm AAC Blockwork Masonry with Polymer Mortar", "cat": "Masonry & Bricks", "calc": "AREA", "h": 10, "w": 480, "unit": "SQFT", "mat": "Siporex"},
                    {"title": "Saint-Gobain Gyproc Elite OneCoat Internal Gypsum Plaster", "cat": "Plaster & Gypsum", "calc": "AREA", "h": 10, "w": 420, "unit": "SQFT", "mat": "Saint-Gobain Gyproc"},
                    {"title": "Dr. Fixit 2-Coat Polymer Waterproofing (Terrace & Sunk)", "cat": "Waterproofing", "calc": "AREA", "h": 40, "w": 45, "unit": "SQFT", "mat": "Dr. Fixit Pidifin"}
                ]
            },
            {
                "name": "Plumbing & Electrical MEP",
                "floor": "Full Structure",
                "items": [
                    {"title": "Astral CPVC Concealed High-Pressure Supply Network", "cat": "Plumbing & Sanitary", "calc": "RUNNING_FT", "l": 850, "unit": "RUNNING_FT", "mat": "Astral CPVC"},
                    {"title": "Polycab FRLS Concealed Wiring & Schneider Modular Points", "cat": "Electrical", "calc": "RUNNING_FT", "l": 2400, "unit": "RUNNING_FT", "mat": "Polycab FRLS"}
                ]
            },
            {
                "name": "Flooring & Italian Marble",
                "floor": "Ground & First Floor",
                "items": [
                    {"title": "Imported Italian Statuario Marble (7-Stage Mirror Polish)", "cat": "Flooring & Tiling", "calc": "AREA", "h": 30, "w": 40, "unit": "SQFT", "mat": "Imported Italian"},
                    {"title": "Kajaria 1200x600mm Glazed Vitrified Tiles in Bedrooms", "cat": "Flooring & Tiling", "calc": "AREA", "qty": 1600, "unit": "SQFT", "mat": "Kajaria 1200x600"}
                ]
            },
            {
                "name": "Turnkey Interior Cabinetry",
                "floor": "Living & Bedrooms",
                "items": [
                    {"title": "Bespoke Modular Kitchen (Century 18mm BWP 710 + Acrylic)", "cat": "Cabinetry", "calc": "FIXED", "qty": 1, "unit": "LOT", "mat": "18mm BWP Plywood 710"},
                    {"title": "Master Bedroom Full-Height Wardrobes (TESA HDHMR + Merino)", "cat": "Cabinetry", "calc": "AREA", "h": 9.5, "w": 14, "unit": "SQFT", "mat": "18mm HDHMR"}
                ]
            }
        ]
    },
    {
        "id": "turnkey_renovation",
        "title": "Turnkey 3BHK Full Civil Renovation & Luxury Interior",
        "category": "Renovation & Interior",
        "property_type": "Full Home Renovation",
        "description": "Complete apartment makeover: Floor-to-ceiling demolition, wall reconfiguration, concealed electrical rewiring, new designer plumbing, full vitrified flooring, false ceiling, and bespoke interior woodwork.",
        "typical_area": 1450,
        "typical_budget": 2400000,
        "rooms": [
            {
                "name": "Demolition & Civil Alterations",
                "floor": "Whole Flat",
                "items": [
                    {"title": "Demolition of Existing Tiles, Partitions & Debris Disposal", "cat": "Civil & Structural", "calc": "FIXED", "qty": 1, "unit": "LOT", "rate": 85000, "cost": 45000},
                    {"title": "New AAC Blockwork Partition Walls & Plastering", "cat": "Masonry & Bricks", "calc": "AREA", "h": 10, "w": 85, "unit": "SQFT", "mat": "Siporex"}
                ]
            },
            {
                "name": "Plumbing Overhaul & Bathroom Retiling",
                "floor": "Master & Common Bathrooms",
                "items": [
                    {"title": "Concealed Astral CPVC Pipe Rerouting & Jaquar Diverters", "cat": "Plumbing & Sanitary", "calc": "FIXED", "qty": 2, "unit": "SET", "rate": 45000, "cost": 28000},
                    {"title": "Dr. Fixit Sunk Slab Waterproofing & Anti-Skid Vitrified Tiles", "cat": "Flooring & Tiling", "calc": "AREA", "h": 12, "w": 15, "unit": "SQFT", "mat": "Somany Anti-Skid"}
                ]
            },
            {
                "name": "Living Room & Kitchen Interior",
                "floor": "Living & Dining",
                "items": [
                    {"title": "Kajaria 1200x600mm Living Room Flooring with Roff Adhesive", "cat": "Flooring & Tiling", "calc": "AREA", "h": 22, "w": 28, "unit": "SQFT", "mat": "Kajaria 1200x600"},
                    {"title": "Designer False Ceiling with Warm White LED Cove Lighting", "cat": "False Ceiling", "calc": "AREA", "h": 20, "w": 26, "unit": "SQFT", "mat": "Gypsum Board False Ceiling"},
                    {"title": "L-Shape Modular Kitchen (18mm BWP 710 Plywood + Acrylic)", "cat": "Cabinetry", "calc": "FIXED", "qty": 1, "unit": "LOT", "rate": 320000, "cost": 210000}
                ]
            },
            {
                "name": "Bedrooms & Painting",
                "floor": "3 Bedrooms",
                "items": [
                    {"title": "3-Door Sliding Wardrobe with Soft-Close Hafele Channels", "cat": "Cabinetry", "calc": "AREA", "h": 9, "w": 10, "unit": "SQFT", "mat": "18mm HDHMR"},
                    {"title": "Asian Paints Royale Luxury Emulsion (Lappam + 2 Coats)", "cat": "Paint", "calc": "AREA", "h": 10, "w": 380, "unit": "SQFT", "mat": "Royale Luxury Emulsion"}
                ]
            }
        ]
    }
]

@router.get("/templates/catalog")
def get_templates_catalog():
    return TEMPLATES_CATALOG

@router.post("/from-template")
def create_project_from_template(payload: dict, db: Session = Depends(get_db)):
    client_id = payload.get("client_id")
    template_id = payload.get("template_id", "turnkey_villa")
    custom_name = payload.get("custom_name")
    location = payload.get("location", "Mumbai Site")
    carpet_area = float(payload.get("carpet_area", 0))

    if not client_id:
        raise HTTPException(status_code=400, detail="client_id is required")

    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=400, detail="Client not found with provided client_id")

    template = next((t for t in TEMPLATES_CATALOG if t["id"] == template_id), TEMPLATES_CATALOG[0])

    proj_name = custom_name or template["title"]
    area = carpet_area if carpet_area > 0 else template["typical_area"]

    # 1. Create Project
    project = Project(
        client_id=client_id,
        name=proj_name,
        property_type=template["property_type"],
        location=location,
        carpet_area=area,
        number_of_rooms=len(template["rooms"]),
        start_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        expected_completion=(datetime.now(timezone.utc) + timedelta(days=120)).strftime("%Y-%m-%d"),
        status="Quotation Draft",
        estimated_budget=template["typical_budget"]
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Cache materials by name prefix
    all_materials = db.query(Material).all()

    def find_mat(prefix):
        if not prefix:
            return None
        prefix_lower = prefix.lower()
        for m in all_materials:
            if prefix_lower in m.name.lower():
                return m
        return None

    # 2. Create Rooms and BOQ Items
    created_boqs = []
    for r_data in template["rooms"]:
        room = Room(
            project_id=project.id,
            name=r_data["name"],
            floor=r_data.get("floor", "General"),
            description=f"Phase: {r_data['name']}"
        )
        db.add(room)
        db.commit()
        db.refresh(room)

        for item_data in r_data["items"]:
            mat = find_mat(item_data.get("mat"))
            unit = item_data.get("unit") or (mat.unit if mat else "SQFT")
            calc_type = item_data.get("calc") or "AREA"
            h = float(item_data.get("h", 0))
            w = float(item_data.get("w", 0))
            l = float(item_data.get("l", 0))
            multiplier = float(item_data.get("multiplier", 1.0))
            net_qty = float(item_data.get("qty", 0))

            if net_qty <= 0:
                net_qty = CalculationEngine.calculate_dimensions(
                    calculation_type=calc_type,
                    height=h,
                    width=w,
                    length=l,
                    multiplier=multiplier,
                    unit=unit
                )

            wastage = mat.default_wastage_percent if mat else 5.0
            _, chargeable_qty = CalculationEngine.apply_wastage(net_qty, wastage)

            purchase_rate = float(item_data.get("cost", 0)) or (mat.purchase_cost if mat else 100.0)
            client_rate = float(item_data.get("rate", 0)) or (mat.client_rate if mat else 150.0)

            tot_cost, tot_amt, margin, _ = CalculationEngine.calculate_item_financials(
                chargeable_quantity=chargeable_qty,
                purchase_rate=purchase_rate,
                client_rate=client_rate
            )

            boq = BOQItem(
                room_id=room.id,
                material_id=mat.id if mat else None,
                item_title=item_data["title"],
                category=item_data.get("cat", "Civil & Structural"),
                calculation_type=calc_type,
                height=h,
                width=w,
                length=l,
                multiplier=multiplier,
                net_quantity=net_qty,
                unit=unit,
                wastage_percent=wastage,
                chargeable_quantity=chargeable_qty,
                purchase_rate=purchase_rate,
                client_rate=client_rate,
                total_cost=tot_cost,
                total_amount=tot_amt,
                gross_margin=margin
            )
            db.add(boq)
            created_boqs.append((room.name, boq))

    db.commit()

    return {
        "success": True,
        "project_id": project.id,
        "project_name": project.name,
        "rooms_count": len(template["rooms"]),
        "boq_items_count": len(created_boqs)
    }

