import re
from typing import Dict, Any

class AIMessageClassifier:
    """
    Intelligent message classification for interior design client feedback.
    Categorizes messages into:
    - Intent: Negotiation, Scope Revision, Confirmation, Meeting Request, Timeline Query, Rejection, Inquiry
    - Sentiment: Positive, Neutral, Negative, Cautious
    - Interest Level: High, Moderate, Low, Lost
    - Action Recommendation
    """

    NEGOTIATION_KEYWORDS = [
        "discount", "reduce", "thoda", "kam", "expensive", "costly", "high price",
        "budget", "best price", "final price", "bargain", "decrease", "offer", "concession",
        "margin", "rates high", "cost high", "lower", "less"
    ]

    SCOPE_CHANGE_KEYWORDS = [
        "change", "modify", "remove", "add", "different", "instead", "acrylic",
        "veneer", "laminate", "wardrobe", "kitchen", "ceiling", "material", "finish",
        "color", "colour", "design", "revision", "replace", "alternate"
    ]

    CONFIRMATION_KEYWORDS = [
        "approved", "finalize", "proceed", "go ahead", "start", "sign", "deal",
        "advance", "payment", "book", "confirm", "accepted", "locking", "ready"
    ]

    MEETING_KEYWORDS = [
        "meet", "visit", "call", "discuss", "phone", "site", "office", "talk",
        "available", "time", "appointment", "connect", "sample"
    ]

    REJECTION_KEYWORDS = [
        "not interested", "cancel", "drop", "dropped", "postpone", "no thanks",
        "too expensive", "went with another", "cannot do", "reject"
    ]

    @classmethod
    def classify_message(cls, text: str, client_name: str = "Client") -> Dict[str, Any]:
        cleaned = text.lower().strip()

        # Check rejection
        if any(w in cleaned for w in cls.REJECTION_KEYWORDS):
            return {
                "sentiment": "Negative",
                "detected_intent": "Declined / Postponed",
                "interest_level": "Lost",
                "suggested_action": "Mark as Not Interested. Send polite closing note or ask for reason.",
                "summary_for_admin": f"🔴 {client_name} declined or postponed the project."
            }

        # Check confirmation / ready to proceed
        if any(w in cleaned for w in cls.CONFIRMATION_KEYWORDS):
            return {
                "sentiment": "Very Positive",
                "detected_intent": "Ready to Finalize / Book",
                "interest_level": "High",
                "suggested_action": "Immediate Action: Call client to schedule contract signing & advance collection.",
                "summary_for_admin": f"🎯 {client_name} wants to finalize the contract and proceed with the project!"
            }

        # Check negotiation
        has_negotiation = any(w in cleaned for w in cls.NEGOTIATION_KEYWORDS)
        has_scope_change = any(w in cleaned for w in cls.SCOPE_CHANGE_KEYWORDS)
        has_meeting = any(w in cleaned for w in cls.MEETING_KEYWORDS)

        # Detect specific room mentions
        rooms_mentioned = []
        for r in ["kitchen", "living room", "bedroom", "master bedroom", "wardrobe", "false ceiling", "tv unit"]:
            if r in cleaned:
                rooms_mentioned.append(r.title())

        room_context = f" for {', '.join(rooms_mentioned)}" if rooms_mentioned else ""

        if has_negotiation and has_scope_change:
            return {
                "sentiment": "Interested (Value-Seeking)",
                "detected_intent": "Negotiation & Material Revision",
                "interest_level": "High",
                "suggested_action": f"Prepare Revision (R1) with alternative material options{room_context} or offer a strategic discount.",
                "summary_for_admin": f"🟡 {client_name} is interested but requested a price negotiation and material changes{room_context}."
            }

        if has_negotiation:
            return {
                "sentiment": "Positive (Budget Conscious)",
                "detected_intent": "Price Negotiation",
                "interest_level": "High",
                "suggested_action": f"Call client to discuss payment terms or offer a closing incentive of 3-5%{room_context}.",
                "summary_for_admin": f"🔔 {client_name} is interested but requested a price negotiation{room_context}."
            }

        if has_scope_change:
            return {
                "sentiment": "Constructive",
                "detected_intent": "Scope / Material Revision",
                "interest_level": "High",
                "suggested_action": f"Create revised quotation version reflecting requested changes{room_context}.",
                "summary_for_admin": f"✏️ {client_name} requested specification adjustments{room_context}."
            }

        if has_meeting:
            return {
                "sentiment": "Positive",
                "detected_intent": "Meeting / Discussion Request",
                "interest_level": "High",
                "suggested_action": "Schedule a site visit or office meeting to review material catalog in person.",
                "summary_for_admin": f"📅 {client_name} requested an in-person meeting/call to discuss the quotation."
            }

        return {
            "sentiment": "Neutral",
            "detected_intent": "General Inquiry",
            "interest_level": "Moderate",
            "suggested_action": "Follow up via WhatsApp or call to address any questions.",
            "summary_for_admin": f"💬 {client_name} replied: \"{text[:60]}...\""
        }
