from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import WhatsAppLog, Quotation, Client, ClientResponse
from ..services.ai_classifier import AIMessageClassifier
from ..services.followup import FollowUpEngine

router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp"])

class InboundWhatsAppMessage(BaseModel):
    phone: str
    message: str
    quotation_number: Optional[str] = None

@router.get("/logs")
def get_whatsapp_logs(db: Session = Depends(get_db)):
    logs = db.query(WhatsAppLog).order_by(WhatsAppLog.created_at.desc()).all()
    results = []
    for l in logs:
        client = db.query(Client).filter(Client.id == l.client_id).first()
        results.append({
            "id": l.id,
            "client_name": client.name if client else "N/A",
            "recipient_phone": l.recipient_phone,
            "message_type": l.message_type,
            "message_body": l.message_body,
            "status": l.status,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })
    return results

@router.post("/simulate-webhook")
def simulate_inbound_whatsapp(payload: InboundWhatsAppMessage, db: Session = Depends(get_db)):
    """
    Simulates incoming WhatsApp message from client.
    Tests AI intent detection, auto cancellation of follow-ups, and status updates.
    """
    # Find client by phone or quote
    clean_p = "".join(c for c in payload.phone if c.isdigit())
    client = None
    if len(clean_p) >= 10:
        tail10 = clean_p[-10:]
        client = db.query(Client).filter(Client.phone.like(f"%{tail10}%")).first()

    quote = None
    if payload.quotation_number:
        quote = db.query(Quotation).filter(Quotation.quotation_number == payload.quotation_number).first()
    elif client:
        # Find active quote for this client
        for p in client.projects:
            if p.quotations:
                quote = p.quotations[-1]
                break

    if not quote and not client:
        raise HTTPException(status_code=404, detail="Could not identify client or quotation from phone number.")

    client_name = client.name if client else (quote.project.client.name if quote else "Client")

    # Run AI classifier
    analysis = AIMessageClassifier.classify_message(payload.message, client_name=client_name)

    # Save log
    wa_in = WhatsAppLog(
        quotation_id=quote.id if quote else None,
        client_id=client.id if client else quote.project.client_id,
        recipient_phone=payload.phone,
        message_type="Inbound Response",
        message_body=payload.message,
        status="Received"
    )
    db.add(wa_in)

    canceled_count = 0
    if quote:
        # Record response
        resp_type = "Interested" if analysis["interest_level"] == "High" else ("Need Changes" if "Revision" in analysis["detected_intent"] or "Negotiation" in analysis["detected_intent"] else "General Inquiry")
        
        cr = ClientResponse(
            quotation_id=quote.id,
            response_type=resp_type,
            comments=payload.message,
            sentiment=analysis["sentiment"],
            detected_intent=analysis["detected_intent"],
            responded_at=datetime.now(timezone.utc)
        )
        db.add(cr)

        # Cancel pending followups
        canceled_count = FollowUpEngine.cancel_pending_followups(db, quote.id, reason=f"Client replied on WhatsApp: {analysis['detected_intent']}")

        # Update statuses
        if "Negotiation" in analysis["detected_intent"]:
            quote.status = "Negotiation"
            quote.project.status = "Negotiation"
        elif "Revision" in analysis["detected_intent"]:
            quote.status = "Revision Requested"
            quote.project.status = "Negotiation"
        elif "Ready" in analysis["detected_intent"]:
            quote.status = "Accepted"
            quote.project.status = "Confirmed"
        else:
            quote.status = "Responded"

    db.commit()

    return {
        "success": True,
        "client": client_name,
        "quotation_number": quote.quotation_number if quote else None,
        "ai_analysis": analysis,
        "cancelled_followups": canceled_count,
        "action_taken": f"Auto-cancelled {canceled_count} scheduled follow-ups. Updated project status to '{quote.project.status if quote else 'Responded'}'."
    }
