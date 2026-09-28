from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..database import get_db
from ..models import Quotation, ClientResponse
from ..schemas import ClientPortalQuotationView, ClientPortalItemView, ClientResponseSubmit
from ..services.ai_classifier import AIMessageClassifier
from ..services.followup import FollowUpEngine

router = APIRouter(prefix="/api/portal", tags=["Client Portal"])

@router.get("/quote/{public_token}", response_model=ClientPortalQuotationView)
def get_client_portal_quote(public_token: str, db: Session = Depends(get_db)):
    q = db.query(Quotation).filter(Quotation.public_token == public_token).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found or link has expired.")

    # Mark as viewed if it was sent
    if q.status == "Quotation Sent":
        q.status = "Viewed"
        db.commit()

    client = q.project.client
    project = q.project

    items_view = [
        ClientPortalItemView(
            room_name=it.room_name,
            item_title=it.item_title,
            material_spec=it.material_spec,
            quantity=it.quantity,
            unit=it.unit,
            rate=it.rate,
            amount=it.amount
        ) for it in q.items
    ]

    return ClientPortalQuotationView(
        quotation_number=q.quotation_number,
        version=q.version,
        client_name=client.name,
        client_city=client.city,
        project_name=project.name,
        property_type=project.property_type,
        location=project.location,
        subtotal=q.subtotal,
        discount_amount=q.discount_amount,
        tax_percent=q.tax_percent,
        tax_amount=q.tax_amount,
        total_amount=q.total_amount,
        valid_until=q.valid_until,
        notes=q.notes,
        terms=q.terms,
        items=items_view,
        status=q.status
    )

@router.post("/quote/{public_token}/respond")
def submit_client_response(public_token: str, response_in: ClientResponseSubmit, db: Session = Depends(get_db)):
    q = db.query(Quotation).filter(Quotation.public_token == public_token).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")

    client_name = q.project.client.name if q.project.client else "Client"

    # Run AI message classification on comments
    comments_text = (response_in.comments or "").strip()
    analysis = AIMessageClassifier.classify_message(comments_text, client_name=client_name)

    # Save response record
    cr = ClientResponse(
        quotation_id=q.id,
        response_type=response_in.response_type,
        comments=comments_text,
        sentiment=analysis["sentiment"],
        detected_intent=analysis["detected_intent"],
        responded_at=datetime.now(timezone.utc)
    )
    db.add(cr)

    # AUTOMATION RULE: Client responded -> stop follow-ups immediately
    canceled_count = FollowUpEngine.cancel_pending_followups(
        db, 
        quotation_id=q.id, 
        reason=f"Client responded with {response_in.response_type}"
    )

    # Update quotation & project status
    if response_in.response_type == "Interested":
        q.status = "Interested"
        q.project.status = "Confirmed" if "Ready" in analysis["detected_intent"] else "Site Visit"
    elif response_in.response_type == "Need Changes":
        q.status = "Revision Requested"
        q.project.status = "Negotiation"
    elif response_in.response_type == "Need More Time":
        q.status = "Follow-up"
        q.project.status = "Follow-up"
    elif response_in.response_type == "Not Interested":
        q.status = "Declined"
        q.project.status = "Cancelled"
    else:
        q.status = "Responded"

    db.commit()

    return {
        "success": True,
        "message": f"Thank you {client_name}! Your response has been received by our design team.",
        "status": q.status,
        "canceled_followups": canceled_count,
        "ai_analysis": analysis
    }
