from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Quotation, QuotationItem, Project, Client
from ..schemas import QuotationCreate, QuotationOut
from ..services.quotation import QuotationService
from ..services.pdf import QuotationPDFService
from ..services.whatsapp import WhatsAppService
from ..services.followup import FollowUpEngine

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])

@router.get("", response_model=List[QuotationOut])
def get_quotations(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Quotation)
    if project_id:
        query = query.filter(Quotation.project_id == project_id)
    return query.order_by(Quotation.created_at.desc()).all()

@router.post("/generate", response_model=QuotationOut)
def generate_quotation(payload: QuotationCreate, db: Session = Depends(get_db)):
    try:
        quote = QuotationService.generate_from_boq(
            db=db,
            project_id=payload.project_id,
            discount_amount=payload.discount_amount,
            tax_percent=payload.tax_percent or 18.0,
            notes=payload.notes,
            terms=payload.terms
        )
        return quote
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{quotation_id}", response_model=QuotationOut)
def get_quotation_detail(quotation_id: str, db: Session = Depends(get_db)):
    q = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return q

@router.post("/{quotation_id}/revision", response_model=QuotationOut)
def create_revision(quotation_id: str, db: Session = Depends(get_db)):
    try:
        revised = QuotationService.create_revision(db, quotation_id)
        return revised
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{quotation_id}/pdf")
def download_quotation_pdf(quotation_id: str, db: Session = Depends(get_db)):
    q = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    project = q.project
    client = project.client

    pdf_bytes = QuotationPDFService.generate_pdf(q, client, project, q.items, tenant=q.tenant)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=Quotation_{q.quotation_number}.pdf"
        }
    )

@router.post("/{quotation_id}/send-whatsapp")
def send_whatsapp(
    quotation_id: str, 
    request: Request,
    portal_base_url: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    q = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    if not portal_base_url:
        portal_base_url = str(request.base_url).rstrip("/")
    else:
        portal_base_url = portal_base_url.rstrip("/")

    client = q.project.client
    result = WhatsAppService.log_and_send(db, q, client, portal_base_url)

    # Automatically schedule automated follow-ups!
    followups = FollowUpEngine.schedule_followups_for_quotation(db, q)

    return {
        **result,
        "followups_scheduled": len(followups),
        "next_followup": followups[0].scheduled_for.isoformat() if followups else None
    }

@router.put("/{quotation_id}/status")
def update_quotation_status(quotation_id: str, status: str, db: Session = Depends(get_db)):
    q = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    q.status = status
    if status in ["Accepted", "Confirmed", "In Progress", "Completed", "Cancelled", "Responded"]:
        FollowUpEngine.cancel_pending_followups(db, q.id, reason=f"Status changed to {status}")
    db.commit()
    return {"message": "Status updated", "status": status}
