from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from ..models import FollowUp, Quotation, Client

class FollowUpEngine:
    @staticmethod
    def schedule_followups_for_quotation(db: Session, quotation: Quotation):
        """
        Schedules automated follow-up cadence:
        Day 0: Quotation Sent
        Day 2 (+2 days): Follow-up #1 (Soft check-in, review assistance)
        Day 5 (+3 days): Follow-up #2 (Material consultation & site visit offer)
        Day 10 (+5 days): Follow-up #3 (Final polite follow-up before closing lead)
        """
        # Cancel any existing pending followups for this quote first
        FollowUpEngine.cancel_pending_followups(db, quotation.id)

        now = datetime.now(timezone.utc)
        schedule_plan = [
            (1, 2, "Follow-up #1: Friendly check-in to confirm receipt and answer initial design questions."),
            (2, 5, "Follow-up #2: Inquire if client wants 3D preview or material catalog consultation."),
            (3, 10, "Final Follow-up: Polite final check regarding schedule & quote validity.")
        ]

        created_followups = []
        for step, days_ahead, note in schedule_plan:
            fu = FollowUp(
                quotation_id=quotation.id,
                client_id=quotation.project.client_id,
                step_number=step,
                scheduled_for=now + timedelta(days=days_ahead),
                status="Pending",
                channel="WhatsApp",
                notes=note
            )
            db.add(fu)
            created_followups.append(fu)

        db.commit()
        return created_followups

    @staticmethod
    def cancel_pending_followups(db: Session, quotation_id: str, reason: str = "Client Responded"):
        """
        Critical Rule: If client responds or status changes, cancel all pending automated follow-ups.
        """
        pending = db.query(FollowUp).filter(
            FollowUp.quotation_id == quotation_id,
            FollowUp.status == "Pending"
        ).all()

        for fu in pending:
            fu.status = "Cancelled"
            fu.notes = f"{fu.notes or ''} [Cancelled: {reason}]"

        db.commit()
        return len(pending)

    @staticmethod
    def get_due_followups(db: Session):
        """
        Returns all follow-ups that are pending and due today or overdue.
        """
        now = datetime.now(timezone.utc)
        return db.query(FollowUp).filter(
            FollowUp.status == "Pending",
            FollowUp.scheduled_for <= now + timedelta(days=1)
        ).all()
