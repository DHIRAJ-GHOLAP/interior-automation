import urllib.parse
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models import WhatsAppLog, Quotation, Client

class WhatsAppService:
    @staticmethod
    def format_quote_message(client_name: str, quotation_number: str, project_name: str, amount: float, portal_url: str) -> str:
        formatted_amount = f"₹{amount:,.2f}"
        return (
            f"Hello {client_name}, your interior quotation has been prepared.\n\n"
            f"📄 *Quotation No:* {quotation_number}\n"
            f"🏠 *Project:* {project_name}\n"
            f"💰 *Amount:* {formatted_amount}\n\n"
            f"Please review your quotation here:\n"
            f"{portal_url}\n\n"
            f"— ABC Interiors"
        )

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
        msg = WhatsAppService.format_quote_message(
            client_name=client.name,
            quotation_number=quotation.quotation_number,
            project_name=quotation.project.name,
            amount=quotation.total_amount,
            portal_url=portal_url
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
            "status": "Logged and Marked as Sent"
        }
