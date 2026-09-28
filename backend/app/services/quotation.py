import re
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models import Quotation, QuotationItem, Project, Room, BOQItem
from .followup import FollowUpEngine

class QuotationService:
    @staticmethod
    def generate_next_quote_number(db: Session) -> str:
        current_year = datetime.now().year
        # Find highest quote number for this year
        prefix = f"INT-{current_year}-"
        quotes = db.query(Quotation.quotation_number).filter(
            Quotation.quotation_number.like(f"{prefix}%")
        ).all()

        max_seq = 0
        for (q_num,) in quotes:
            match = re.search(r"INT-\d+-(\d+)", q_num)
            if match:
                try:
                    num = int(match.group(1))
                    if num > max_seq:
                        max_seq = num
                except ValueError:
                    pass

        next_num = max_seq + 1
        return f"INT-{current_year}-{next_num:04d}"

    @staticmethod
    def generate_from_boq(
        db: Session,
        project_id: str,
        discount_amount: float = 0.0,
        tax_percent: float = 18.0,
        notes: str = None,
        terms: str = None
    ) -> Quotation:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Project not found")

        quote_number = QuotationService.generate_next_quote_number(db)

        # Pull all BOQ items across all rooms in this project
        rooms = db.query(Room).filter(Room.project_id == project_id).all()
        
        subtotal = 0.0
        total_cost = 0.0
        quote_items = []

        for room in rooms:
            boq_list = db.query(BOQItem).filter(BOQItem.room_id == room.id).all()
            for b in boq_list:
                item_amt = b.total_amount
                item_cost = b.total_cost
                subtotal += item_amt
                total_cost += item_cost

                # Build material spec string
                spec_str = f"{b.chargeable_quantity} {b.unit}"
                if b.material:
                    m = b.material
                    spec_str = f"{m.brand or ''} {m.thickness or ''} {m.material_type or ''} {m.name}".strip()

                q_item = QuotationItem(
                    room_name=room.name,
                    item_title=b.item_title,
                    material_spec=spec_str,
                    quantity=b.chargeable_quantity,
                    unit=b.unit,
                    rate=b.client_rate,
                    amount=item_amt,
                    unit_cost=b.purchase_rate,
                    total_cost=item_cost
                )
                quote_items.append(q_item)

        discount_amount = max(0.0, float(discount_amount))
        discounted_subtotal = max(0.0, subtotal - discount_amount)
        tax_amount = round(discounted_subtotal * (tax_percent / 100.0), 2)
        total_amount = round(discounted_subtotal + tax_amount, 2)
        gross_margin = round(total_amount - total_cost, 2)
        margin_percent = round((gross_margin / total_amount * 100.0), 2) if total_amount > 0 else 0.0

        quotation = Quotation(
            project_id=project.id,
            quotation_number=quote_number,
            version="R0",
            status="Draft",
            subtotal=round(subtotal, 2),
            discount_amount=round(discount_amount, 2),
            tax_percent=tax_percent,
            tax_amount=tax_amount,
            total_amount=total_amount,
            total_cost=round(total_cost, 2),
            gross_margin=gross_margin,
            margin_percent=margin_percent,
            valid_until="15 days from issue",
            notes=notes or "Comprehensive turnkey interior proposal.",
            terms=terms or "50% Advance at booking, 40% on material delivery at site, 10% on handover.",
            items=quote_items
        )

        db.add(quotation)
        project.status = "Quotation Draft"
        db.commit()
        db.refresh(quotation)
        return quotation

    @staticmethod
    def create_revision(db: Session, parent_id: str, modification_notes: str = None) -> Quotation:
        parent = db.query(Quotation).filter(Quotation.id == parent_id).first()
        if not parent:
            raise ValueError("Parent quotation not found")

        # Determine revision label
        # INT-2026-0047 -> INT-2026-0047-R1
        base_num = parent.quotation_number.split("-R")[0]
        existing_revisions = db.query(Quotation).filter(
            Quotation.quotation_number.like(f"{base_num}-R%")
        ).count()
        rev_index = existing_revisions + 1
        new_version = f"R{rev_index}"
        new_quote_num = f"{base_num}-{new_version}"

        # Mark parent as Revised
        parent.status = "Revised"

        # Clone items
        new_items = []
        for it in parent.items:
            new_it = QuotationItem(
                room_name=it.room_name,
                item_title=it.item_title,
                material_spec=it.material_spec,
                quantity=it.quantity,
                unit=it.unit,
                rate=it.rate,
                amount=it.amount,
                unit_cost=it.unit_cost,
                total_cost=it.total_cost
            )
            new_items.append(new_it)

        new_quote = Quotation(
            project_id=parent.project_id,
            quotation_number=new_quote_num,
            version=new_version,
            parent_quotation_id=parent.id,
            status="Draft",
            subtotal=parent.subtotal,
            discount_amount=parent.discount_amount,
            tax_percent=parent.tax_percent,
            tax_amount=parent.tax_amount,
            total_amount=parent.total_amount,
            total_cost=parent.total_cost,
            gross_margin=parent.gross_margin,
            margin_percent=parent.margin_percent,
            valid_until=parent.valid_until,
            notes=modification_notes or f"Revision based on client request for {parent.quotation_number}.",
            terms=parent.terms,
            items=new_items
        )

        db.add(new_quote)
        db.commit()
        db.refresh(new_quote)
        return new_quote
