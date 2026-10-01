from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Client, Project, Quotation
from ..schemas import ClientCreate, ClientOut

router = APIRouter(prefix="/api/clients", tags=["Clients"])

@router.get("", response_model=List[ClientOut])
def get_clients(db: Session = Depends(get_db)):
    clients = db.query(Client).order_by(Client.created_at.desc()).all()
    results = []
    for c in clients:
        c_dict = {
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "whatsapp": c.whatsapp,
            "email": c.email,
            "address": c.address,
            "city": c.city,
            "notes": c.notes,
            "created_at": c.created_at,
            "projects_count": len(c.projects)
        }
        results.append(ClientOut(**c_dict))
    return results

@router.post("", response_model=ClientOut)
def create_client(client_in: ClientCreate, db: Session = Depends(get_db)):
    client = Client(**client_in.dict())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.get("/{client_id}")
def get_client_detail(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    projects_data = []
    for p in client.projects:
        quotes = [
            {
                "id": q.id,
                "quotation_number": q.quotation_number,
                "version": q.version,
                "status": q.status,
                "total_amount": q.total_amount,
                "gross_margin": q.gross_margin,
                "public_token": q.public_token,
                "created_at": q.created_at
            } for q in p.quotations
        ]
        projects_data.append({
            "id": p.id,
            "name": p.name,
            "property_type": p.property_type,
            "location": p.location,
            "carpet_area": p.carpet_area,
            "status": p.status,
            "estimated_budget": p.estimated_budget,
            "quotations": quotes
        })

    return {
        "id": client.id,
        "name": client.name,
        "phone": client.phone,
        "whatsapp": client.whatsapp,
        "email": client.email,
        "address": client.address,
        "city": client.city,
        "notes": client.notes,
        "created_at": client.created_at,
        "projects": projects_data
    }

@router.put("/{client_id}", response_model=ClientOut)
def update_client(client_id: str, client_in: ClientCreate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    for field, val in client_in.dict().items():
        setattr(client, field, val)
    db.commit()
    db.refresh(client)
    return client

@router.delete("/{client_id}")
def delete_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return {"message": "Client already deleted or does not exist", "id": client_id}
    
    # Clean up WhatsApp logs for this client
    from ..models import WhatsAppLog
    db.query(WhatsAppLog).filter(WhatsAppLog.client_id == client_id).delete(synchronize_session=False)

    # Safely clear self-referential parent_quotation_id for quotes under this client
    proj_ids = [p.id for p in client.projects]
    if proj_ids:
        quotes = db.query(Quotation).filter(Quotation.project_id.in_(proj_ids)).all()
        quote_ids = [q.id for q in quotes]
        if quote_ids:
            db.query(Quotation).filter(Quotation.parent_quotation_id.in_(quote_ids)).update(
                {Quotation.parent_quotation_id: None}, synchronize_session=False
            )
            db.query(WhatsAppLog).filter(WhatsAppLog.quotation_id.in_(quote_ids)).update(
                {WhatsAppLog.quotation_id: None}, synchronize_session=False
            )

    db.delete(client)
    db.commit()
    return {"message": "Client deleted successfully"}
