from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from ..database import get_db
from ..models import Quotation, Project, Client, ClientResponse, FollowUp

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    total_clients = db.query(Client).count()
    
    # 1. Project counts by status in a single query
    proj_status_rows = db.query(Project.status, func.count(Project.id)).group_by(Project.status).all()
    proj_status_counts = {status: count for status, count in proj_status_rows}
    total_projects = sum(proj_status_counts.values())

    # 2. Quotations
    quotes = db.query(Quotation).all()
    quotes_created = len(quotes)
    quotes_sent = sum(1 for q in quotes if q.status in ["Quotation Sent", "Viewed", "Responded", "Interested", "Revision Requested", "Accepted", "Confirmed"])
    responses = db.query(ClientResponse).count()
    interested_count = sum(1 for q in quotes if q.status in ["Interested", "Accepted", "Confirmed"])
    negotiations = sum(1 for q in quotes if q.status in ["Revision Requested", "Negotiation"])

    won_project_ids = {q.project_id for q in quotes if q.status in ["Accepted", "Confirmed"] and q.project_id}
    won_proj_db_ids = {row[0] for row in db.query(Project.id).filter(Project.status.in_(["Confirmed", "In Progress", "Completed"])).all()}
    won_projects = len(won_project_ids | won_proj_db_ids)

    total_quote_value = sum(q.total_amount for q in quotes)
    total_won_value = sum(q.total_amount for q in quotes if q.status in ["Accepted", "Confirmed", "In Progress", "Completed"])
    total_cost_val = sum(q.total_cost for q in quotes)
    total_margin_val = sum(q.gross_margin for q in quotes)
    avg_margin_pct = round((total_margin_val / total_quote_value * 100), 1) if total_quote_value > 0 else 0

    pending_followups = db.query(FollowUp).filter(FollowUp.status == "Pending").count()

    # Pipeline stage counts
    pipeline = {
        "new": proj_status_counts.get("New", 0),
        "measurement": proj_status_counts.get("Measurement Pending", 0),
        "draft": sum(1 for q in quotes if q.status == "Draft"),
        "sent": quotes_sent,
        "negotiation": negotiations,
        "won": won_projects
    }

    # Recent activity with eager loading to prevent N+1 queries
    recent_responses = (
        db.query(ClientResponse)
        .options(
            joinedload(ClientResponse.quotation)
            .joinedload(Quotation.project)
            .joinedload(Project.client)
        )
        .order_by(ClientResponse.responded_at.desc())
        .limit(5)
        .all()
    )
    activity = []
    for r in recent_responses:
        q = r.quotation
        activity.append({
            "quote_number": q.quotation_number if q else "N/A",
            "client_name": q.project.client.name if (q and q.project and q.project.client) else "Client",
            "response_type": r.response_type,
            "sentiment": r.sentiment,
            "intent": r.detected_intent,
            "comments": r.comments,
            "responded_at": r.responded_at.isoformat() if r.responded_at else None
        })

    return {
        "kpis": {
            "quotes_created": quotes_created,
            "quotes_sent": quotes_sent,
            "client_responses": responses,
            "interested": interested_count,
            "negotiations": negotiations,
            "projects_won": won_projects,
            "total_quotation_value": round(total_quote_value, 2),
            "won_projects_value": round(total_won_value, 2),
            "internal_cost": round(total_cost_val, 2),
            "gross_margin": round(total_margin_val, 2),
            "average_margin_percent": avg_margin_pct,
            "pending_followups": pending_followups,
            "total_clients": total_clients,
            "total_projects": total_projects
        },
        "pipeline": pipeline,
        "recent_responses": activity
    }
