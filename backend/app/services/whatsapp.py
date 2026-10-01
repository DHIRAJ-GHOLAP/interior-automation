import urllib.parse
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models import WhatsAppLog, Quotation, Client

class WhatsAppService:
    @staticmethod
    def format_quote_message(
        client_name: str, 
        quotation_number: str, 
        project_name: str, 
        amount: float, 
        portal_url: str,
        pdf_url: str = None,
        studio_name: str = "More Construction and Interior"
    ) -> str:
        formatted_amount = f"Rs. {amount:,.2f}"
        lines = [
            f"Hello {client_name},",
            f"",
            f"Greetings from *{studio_name}*! Your detailed interior estimate & design proposal is ready for review.",
            f"",
            f"- *Quotation No:* {quotation_number}",
            f"- *Project:* {project_name}",
            f"- *Total Proposal Value:* {formatted_amount}",
            f"",
            f"----------------------------------------",
            f"*1. View Interactive Proposal & Reply Online:*",
            f"{portal_url}",
            f"_(Review room-by-room BOQ items, specifications, and approve or request revisions directly on your phone)_",
            f"",
        ]
        if pdf_url:
            lines.extend([
                f"*2. Download Official Branded PDF:*",
                f"{pdf_url}",
                f"",
            ])
        lines.extend([
            f"----------------------------------------",
            f"*Quick Reply:* You can review the proposal and approve or request revisions directly through the online link above or reply right here on WhatsApp!",
            f"",
            f"Warm regards,",
            f"*{studio_name}*"
        ])
        return "\n".join(lines)

    @staticmethod
    def create_whatsapp_link(phone: str, message: str) -> str:
        # Clean phone number (strip spaces, dashes, ensure country code)
        cleaned_phone = "".join(c for c in phone if c.isdigit())
        if len(cleaned_phone) == 10:
            cleaned_phone = "91" + cleaned_phone
        encoded_msg = urllib.parse.quote(message)
        return f"https://wa.me/{cleaned_phone}?text={encoded_msg}"

    @staticmethod
    def log_and_send(db: Session, quotation: Quotation, client: Client, portal_base_url: str) -> dict:
        portal_url = f"{portal_base_url}/quote/{quotation.public_token}"
        pdf_url = f"{portal_base_url}/api/quotations/{quotation.id}/pdf"
        studio_name = quotation.tenant.name if (quotation.tenant and quotation.tenant.name) else "More Construction and Interior"

        msg = WhatsAppService.format_quote_message(
            client_name=client.name,
            quotation_number=quotation.quotation_number,
            project_name=quotation.project.name,
            amount=quotation.total_amount,
            portal_url=portal_url,
            pdf_url=pdf_url,
            studio_name=studio_name
        )

        wa_log = WhatsAppLog(
            quotation_id=quotation.id,
            client_id=client.id,
            recipient_phone=client.whatsapp or client.phone,
            message_type="Quotation",
            message_body=msg,
            status="Sent"
        )
        db.add(wa_log)
        
        quotation.status = "Quotation Sent"
        quotation.sent_at = datetime.now(timezone.utc)
        quotation.project.status = "Quotation Sent"
        db.commit()

        direct_link = WhatsAppService.create_whatsapp_link(client.whatsapp or client.phone, msg)
        return {
            "message": msg,
            "direct_whatsapp_link": direct_link,
            "recipient_phone": client.whatsapp or client.phone,
            "status": "Logged and Marked as Sent",
            "portal_url": portal_url,
            "pdf_url": pdf_url
        }
