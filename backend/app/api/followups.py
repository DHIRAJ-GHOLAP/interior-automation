from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List
from ..database import get_db
from ..models import FollowUp, Quotation, Client

router = APIRouter(prefix="/api/followups", tags=["Follow-ups"])

@router.get("")
def get_all_followups(db: Session = Depends(get_db)):
    fus = db.query(FollowUp).order_by(FollowUp.scheduled_for.asc()).all()
    results = []
    for f in fus:
        client = db.query(Client).filter(Client.id == f.client_id).first()
        quote = db.query(Quotation).filter(Quotation.id == f.quotation_id).first()
        results.append({
            "id": f.id,
            "step_number": f.step_number,
            "scheduled_for": f.scheduled_for.isoformat() if f.scheduled_for else None,
            "status": f.status,
            "channel": f.channel,
            "notes": f.notes,
            "client_name": client.name if client else "N/A",
            "client_phone": client.phone if client else "N/A",
            "quotation_number": quote.quotation_number if quote else "N/A",
            "total_amount": quote.total_amount if quote else 0.0,
            "quote_status": quote.status if quote else "N/A"
        })
    return results

@router.get("/today")
def get_today_followups(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    fus = db.query(FollowUp).filter(
        FollowUp.status == "Pending"
    ).order_by(FollowUp.scheduled_for.asc()).all()

    due_today = []
    upcoming = []

    for f in fus:
        client = db.query(Client).filter(Client.id == f.client_id).first()
        quote = db.query(Quotation).filter(Quotation.id == f.quotation_id).first()
        item = {
            "id": f.id,
            "step_number": f.step_number,
            "scheduled_for": f.scheduled_for.isoformat() if f.scheduled_for else None,
            "status": f.status,
            "channel": f.channel,
            "notes": f.notes,
            "client_name": client.name if client else "N/A",
            "client_phone": client.phone if client else "N/A",
            "quotation_number": quote.quotation_number if quote else "N/A",
            "total_amount": quote.total_amount if quote else 0.0,
            "quote_status": quote.status if quote else "N/A"
        }
        # If scheduled time is in the past or within next 24h
        sched = f.scheduled_for.replace(tzinfo=None) if (f.scheduled_for and f.scheduled_for.tzinfo) else f.scheduled_for
        if sched and (sched <= now or (sched - now).days <= 0):
            item["urgency"] = "DUE_TODAY"
            due_today.append(item)
        else:
            item["urgency"] = "UPCOMING"
            upcoming.append(item)

    return {
        "due_today": due_today,
        "upcoming": upcoming,
        "total_pending": len(fus)
    }

@router.post("/{followup_id}/complete")
def complete_followup(followup_id: str, db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == followup_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Followup not found")
    fu.status = "Completed"
    fu.sent_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Followup completed"}

@router.post("/{followup_id}/cancel")
def cancel_followup(followup_id: str, db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == followup_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Followup not found")
    fu.status = "Cancelled"
    db.commit()
    return {"message": "Followup cancelled"}
