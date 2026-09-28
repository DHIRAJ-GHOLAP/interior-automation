import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, 
    Paragraph, 
    Spacer, 
    Table, 
    TableStyle, 
    HRFlowable, 
    KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ------------------------------------------------------------------------------
# Lavish Typography & Unicode Currency Initialization
# ------------------------------------------------------------------------------
font_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "fonts")

serif_reg = os.path.join(font_dir, "DejaVuSerif.ttf")
serif_bd = os.path.join(font_dir, "DejaVuSerif-Bold.ttf")
serif_it = os.path.join(font_dir, "DejaVuSerif-Italic.ttf")

sans_reg = os.path.join(font_dir, "DejaVuSans.ttf")
sans_bd = os.path.join(font_dir, "DejaVuSans-Bold.ttf")

if not os.path.exists(serif_reg):
    serif_reg = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
    serif_bd = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
    serif_it = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf"
if not os.path.exists(sans_reg):
    sans_reg = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    sans_bd = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

FONT_SERIF = "Times-Roman"
FONT_SERIF_BOLD = "Times-Bold"
FONT_SERIF_ITALIC = "Times-Italic"
FONT_SANS = "Helvetica"
FONT_SANS_BOLD = "Helvetica-Bold"
CURRENCY_PREFIX = "Rs."

if os.path.exists(serif_reg) and os.path.exists(serif_bd):
    try:
        pdfmetrics.registerFont(TTFont("LavishSerif", serif_reg))
        pdfmetrics.registerFont(TTFont("LavishSerif-Bold", serif_bd))
        FONT_SERIF = "LavishSerif"
        FONT_SERIF_BOLD = "LavishSerif-Bold"
        CURRENCY_PREFIX = "₹"
        if os.path.exists(serif_it):
            pdfmetrics.registerFont(TTFont("LavishSerif-Italic", serif_it))
            FONT_SERIF_ITALIC = "LavishSerif-Italic"
    except Exception:
        pass

if os.path.exists(sans_reg) and os.path.exists(sans_bd):
    try:
        pdfmetrics.registerFont(TTFont("LavishSans", sans_reg))
        pdfmetrics.registerFont(TTFont("LavishSans-Bold", sans_bd))
        FONT_SANS = "LavishSans"
        FONT_SANS_BOLD = "LavishSans-Bold"
    except Exception:
        pass

FONT_REGULAR = FONT_SERIF
FONT_BOLD = FONT_SERIF_BOLD

def format_inr(amount: float, symbol: str = CURRENCY_PREFIX) -> str:
    """
    Formats amounts in Indian Lakhs and Crores grouping (e.g. 10,26,600.00).
    """
    if amount is None:
        amount = 0.0
    abs_amt = abs(amount)
    parts = f"{abs_amt:.2f}".split(".")
    int_part = parts[0]
    dec_part = parts[1]

    if len(int_part) <= 3:
        formatted_int = int_part
    else:
        last3 = int_part[-3:]
        rest = int_part[:-3]
        groups = []
        while len(rest) > 2:
            groups.append(rest[-2:])
            rest = rest[:-2]
        if rest:
            groups.append(rest)
        groups.reverse()
        formatted_int = ",".join(groups) + "," + last3

    sign = "-" if amount < 0 else ""
    return f"{sign}{symbol} {formatted_int}.{dec_part}"

def amount_to_words_inr(num: float) -> str:
    """
    Converts numeric amount to official Indian currency wording.
    """
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    def convert_below_thousand(n):
        res = ""
        if n >= 100:
            res += ones[n // 100] + " Hundred "
            n %= 100
        if n >= 20:
            res += tens[n // 10] + " "
            n %= 10
        if n > 0:
            res += ones[n] + " "
        return res.strip()

    total_int = int(round(num))
    if total_int == 0:
        return "INR Zero Only"

    crore = total_int // 10000000
    total_int %= 10000000
    lakh = total_int // 100000
    total_int %= 100000
    thousand = total_int // 1000
    total_int %= 1000
    rem = total_int

    parts = []
    if crore > 0:
        parts.append(convert_below_thousand(crore) + " Crore")
    if lakh > 0:
        parts.append(convert_below_thousand(lakh) + " Lakh")
    if thousand > 0:
        parts.append(convert_below_thousand(thousand) + " Thousand")
    if rem > 0:
        parts.append(convert_below_thousand(rem))

    return "INR " + " ".join(parts).strip() + " Only"

# ------------------------------------------------------------------------------
# Dynamic Numbered Multi-Page Canvas (Page X of Y + Running Footer)
# ------------------------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont(FONT_SERIF, 7)
        self.setFillColor(colors.HexColor('#64748B'))

        # Running bottom rule
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.6)
        self.line(36, 26, 612 - 36, 26)

        # Bottom Left: Confidentiality and studio note
        self.drawString(36, 15, "Confidential • More Construction and Interior • Turnkey Architectural Proposal")

        # Bottom Right: Page X of Y
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(612 - 36, 15, page_str)
        self.restoreState()

# ------------------------------------------------------------------------------
# Luxury Professional PDF Generator Service
# ------------------------------------------------------------------------------
class QuotationPDFService:
    @staticmethod
    def generate_pdf(quotation, client, project, items, tenant=None) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=32,
            bottomMargin=32
        )

        styles = getSampleStyleSheet()

        # Studio Identity
        studio_name = (tenant.name if tenant and tenant.name else "MORE CONSTRUCTION AND INTERIOR").upper()
        studio_phone = tenant.company_phone if tenant and tenant.company_phone else "+91 70389 88038"
        studio_email = tenant.company_email if tenant and tenant.company_email else "contact@moreconstruction.com"
        studio_gst = tenant.gst_number if tenant and tenant.gst_number else "27AAAPL1234F1Z9"
        studio_city = tenant.city if tenant and tenant.city else "Mumbai"
        studio_address = tenant.address if tenant and tenant.address else "Level 4, Trade Centre, BKC, Mumbai"

        # Bank & UPI Details
        bank_name = tenant.bank_name if tenant and tenant.bank_name else "ICICI Bank"
        bank_acc = tenant.bank_account_no if tenant and tenant.bank_account_no else "001205001234"
        bank_ifsc = tenant.bank_ifsc if tenant and tenant.bank_ifsc else "ICIC0000012"
        bank_upi = tenant.upi_id if tenant and tenant.upi_id else "moreconstruction@icici"

        # Typography Styles
        style_studio_title = ParagraphStyle(
            'StudioTitle',
            fontName=FONT_SERIF_BOLD,
            fontSize=16.5,
            leading=19.5,
            textColor=colors.HexColor('#0F172A')
        )

        style_studio_tagline = ParagraphStyle(
            'StudioTagline',
            fontName=FONT_SERIF,
            fontSize=7.5,
            leading=11,
            textColor=colors.HexColor('#475569')
        )

        style_doc_title = ParagraphStyle(
            'DocTitle',
            fontName=FONT_SERIF_BOLD,
            fontSize=13.5,
            leading=16.5,
            alignment=2, # Right
            textColor=colors.HexColor('#0F172A')
        )

        style_doc_meta = ParagraphStyle(
            'DocMeta',
            fontName=FONT_SERIF,
            fontSize=8,
            leading=11.5,
            alignment=2,
            textColor=colors.HexColor('#475569')
        )

        style_card_title = ParagraphStyle(
            'CardTitle',
            fontName=FONT_SERIF_BOLD,
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#0F172A')
        )

        style_card_body = ParagraphStyle(
            'CardBody',
            fontName=FONT_SERIF,
            fontSize=7.5,
            leading=11,
            textColor=colors.HexColor('#334155')
        )

        style_section_title = ParagraphStyle(
            'SectionTitle',
            fontName=FONT_SERIF_BOLD,
            fontSize=9.5,
            leading=12.5,
            textColor=colors.HexColor('#0F172A')
        )

        style_th = ParagraphStyle(
            'TableHead',
            fontName=FONT_SERIF_BOLD,
            fontSize=7.5,
            leading=9.5,
            textColor=colors.white
        )

        style_th_right = ParagraphStyle(
            'TableHeadRight',
            fontName=FONT_SERIF_BOLD,
            fontSize=7.5,
            leading=9.5,
            alignment=2,
            textColor=colors.white
        )

        style_th_center = ParagraphStyle(
            'TableHeadCenter',
            fontName=FONT_SERIF_BOLD,
            fontSize=7.5,
            leading=9.5,
            alignment=1,
            textColor=colors.white
        )

        style_td = ParagraphStyle(
            'TableDesc',
            fontName=FONT_SERIF_BOLD,
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor('#0F172A')
        )

        style_td_spec = ParagraphStyle(
            'TableDescSpec',
            fontName=FONT_SERIF,
            fontSize=6.8,
            leading=9,
            textColor=colors.HexColor('#64748B')
        )

        style_td_room = ParagraphStyle(
            'TableRoomBadge',
            fontName=FONT_SERIF_BOLD,
            fontSize=7,
            leading=9,
            textColor=colors.HexColor('#1D4ED8')
        )

        style_td_right = ParagraphStyle(
            'TableDescRight',
            fontName=FONT_SERIF,
            fontSize=7.5,
            leading=10,
            alignment=2,
            textColor=colors.HexColor('#1E293B')
        )

        style_td_center = ParagraphStyle(
            'TableDescCenter',
            fontName=FONT_SERIF,
            fontSize=7.5,
            leading=10,
            alignment=1,
            textColor=colors.HexColor('#334155')
        )

        style_td_amount = ParagraphStyle(
            'TableDescAmount',
            fontName=FONT_SERIF_BOLD,
            fontSize=7.5,
            leading=10,
            alignment=2,
            textColor=colors.HexColor('#0F172A')
        )

        style_total_label = ParagraphStyle(
            'TotalLabel',
            fontName=FONT_SERIF,
            fontSize=8,
            leading=10.5,
            alignment=2,
            textColor=colors.HexColor('#475569')
        )

        style_total_val = ParagraphStyle(
            'TotalVal',
            fontName=FONT_SERIF_BOLD,
            fontSize=8,
            leading=10.5,
            alignment=2,
            textColor=colors.HexColor('#0F172A')
        )

        style_grand_label = ParagraphStyle(
            'GrandLabel',
            fontName=FONT_SERIF_BOLD,
            fontSize=10,
            leading=12,
            alignment=2,
            textColor=colors.HexColor('#78350F')
        )

        style_grand_val = ParagraphStyle(
            'GrandVal',
            fontName=FONT_SERIF_BOLD,
            fontSize=12,
            leading=14,
            alignment=2,
            textColor=colors.HexColor('#92400E')
        )

        style_terms = ParagraphStyle(
            'TermsText',
            fontName=FONT_SERIF,
            fontSize=7,
            leading=9.5,
            textColor=colors.HexColor('#475569')
        )

        story = []

        # ----------------------------------------------------------------------
        # Top Luxury Accent Ribbon (Navy + Royal Blue + Gold)
        # ----------------------------------------------------------------------
        ribbon_table = Table([
            ["", "", ""]
        ], colWidths=[3.5 * inch, 2.5 * inch, 1.5 * inch], rowHeights=[3.5])
        ribbon_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), colors.HexColor('#0F172A')),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#B45309')),
            ('BACKGROUND', (2,0), (2,0), colors.HexColor('#D97706')),
            ('PADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(ribbon_table)
        story.append(Spacer(1, 8))

        # ----------------------------------------------------------------------
        # Premium Letterhead Banner
        # ----------------------------------------------------------------------
        quote_num = quotation.quotation_number or "INT-2026-0047"
        date_str = quotation.created_at.strftime('%d %b %Y') if quotation.created_at else datetime.now().strftime('%d %b %Y')
        valid_str = quotation.valid_until or "15 days from issue"
        version_str = quotation.version or "R0"
        status_label = (quotation.status or "Official Quotation").upper()

        header_table = Table([
            [
                Paragraph(f"<b>{studio_name}</b>", style_studio_title),
                Paragraph(f"<b>INTERIOR SPECIFICATION & QUOTATION</b><br/><font size='9' color='#B45309'><b>#{quote_num}</b></font>", style_doc_title)
            ],
            [
                Paragraph(
                    f"Turnkey Civil Construction & Luxury Architectural Interiors<br/>"
                    f"Phone: {studio_phone} • Email: {studio_email}<br/>"
                    f"{studio_address} • <b>GSTIN:</b> {studio_gst}",
                    style_studio_tagline
                ),
                Paragraph(
                    f"<b>Date:</b> {date_str} • <b>Validity:</b> {valid_str}<br/>"
                    f"<b>Version:</b> {version_str} &nbsp;|&nbsp; <font color='#B45309'><b>{status_label}</b></font>",
                    style_doc_meta
                )
            ]
        ], colWidths=[4.2 * inch, 3.3 * inch])

        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#E2E8F0'), spaceAfter=8))

        # ----------------------------------------------------------------------
        # Client & Project Specifications Cards (Side-by-Side)
        # ----------------------------------------------------------------------
        client_name = client.name if client else "Valued Client"
        client_phone = client.phone if client else "N/A"
        client_wa = client.whatsapp if client else None
        client_email = client.email if client else "N/A"
        client_city = client.city if client else "Mumbai"
        c_address = (client.address or client_city) if client else "Site Address"
        p_location = (project.location or client_city) if project else "Mumbai"
        carpet_str = f"{project.carpet_area:,.1f} sq.ft" if (project and project.carpet_area) else "Standard"

        client_card_content = [
            Paragraph("<b>CLIENT INFORMATION</b>", style_card_title),
            Spacer(1, 2),
            Paragraph(
                f"<b>Client Name:</b> {client_name}<br/>"
                f"<b>Phone:</b> {client_phone}" + (f" &nbsp;|&nbsp; <b>WA:</b> {client_wa}" if client_wa else "") + "<br/>"
                f"<b>Email:</b> {client_email}<br/>"
                f"<b>Site Address:</b> {c_address}",
                style_card_body
            )
        ]

        project_card_content = [
            Paragraph("<b>PROJECT SPECIFICATIONS</b>", style_card_title),
            Spacer(1, 2),
            Paragraph(
                f"<b>Project Name:</b> {project.name}<br/>"
                f"<b>Property Type:</b> {project.property_type or 'Turnkey Interior'}<br/>"
                f"<b>Site Location:</b> {p_location}<br/>"
                f"<b>Carpet Area:</b> {carpet_str}",
                style_card_body
            )
        ]

        cards_table = Table([
            [client_card_content, project_card_content]
        ], colWidths=[3.75 * inch, 3.75 * inch])

        cards_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(cards_table)
        story.append(Spacer(1, 10))

        # ----------------------------------------------------------------------
        # Room-Wise Specifications & Bill of Quantities Table
        # ----------------------------------------------------------------------
        story.append(Paragraph("<b>ROOM-WISE SPECIFICATIONS & BILL OF QUANTITIES</b>", style_section_title))
        story.append(Spacer(1, 4))

        # Distinct column header without black boxes
        table_headers = [
            Paragraph("Item Description & Material Specification", style_th),
            Paragraph("Room / Area", style_th),
            Paragraph("Qty", style_th_center),
            Paragraph("Unit", style_th_center),
            Paragraph("Rate (INR)", style_th_right),
            Paragraph("Amount (INR)", style_th_right)
        ]

        table_data = [table_headers]

        for it in items:
            item_p = Paragraph(f"<b>{it.item_title}</b>", style_td)
            if it.material_spec:
                spec_p = Paragraph(it.material_spec, style_td_spec)
                desc_cell = [item_p, Spacer(1, 0.5), spec_p]
            else:
                desc_cell = item_p

            room_p = Paragraph(it.room_name or "General", style_td_room)
            qty_p = Paragraph(f"{it.quantity:,.1f}", style_td_center)
            unit_p = Paragraph(str(it.unit or "SQFT"), style_td_center)
            rate_p = Paragraph(format_inr(it.rate, symbol=CURRENCY_PREFIX), style_td_right)
            amount_p = Paragraph(format_inr(it.amount, symbol=CURRENCY_PREFIX), style_td_amount)

            table_data.append([desc_cell, room_p, qty_p, unit_p, rate_p, amount_p])

        # Widths: Total 7.5 inches
        boq_table = Table(
            table_data, 
            colWidths=[2.8 * inch, 1.1 * inch, 0.5 * inch, 0.6 * inch, 1.1 * inch, 1.4 * inch],
            repeatRows=1
        )

        boq_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
        ]))
        story.append(boq_table)
        story.append(Spacer(1, 8))

        # ----------------------------------------------------------------------
        # Financial Commercials Breakdown & Grand Total
        # ----------------------------------------------------------------------
        subtotal_val = quotation.subtotal or 0.0
        discount_val = quotation.discount_amount or 0.0
        tax_pct = quotation.tax_percent or 18.0
        tax_val = quotation.tax_amount or 0.0
        total_val = quotation.total_amount or 0.0

        totals_rows = [
            [Paragraph("Subtotal (Excl. Taxes):", style_total_label), Paragraph(format_inr(subtotal_val), style_total_val)],
        ]

        if discount_val > 0:
            totals_rows.append([
                Paragraph("<font color='#059669'><b>Courtesy Discount:</b></font>", style_total_label),
                Paragraph(f"<font color='#059669'><b>- {format_inr(discount_val)}</b></font>", style_total_val)
            ])

        totals_rows.extend([
            [Paragraph(f"GST ({tax_pct:.1f}% CGST+SGST):", style_total_label), Paragraph(format_inr(tax_val), style_total_val)],
            [Paragraph("<b>TOTAL PAYABLE:</b>", style_grand_label), Paragraph(format_inr(total_val), style_grand_val)]
        ])

        totals_table = Table(totals_rows, colWidths=[2.2 * inch, 1.8 * inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#EFF6FF')),
            ('BOX', (0,-1), (-1,-1), 1, colors.HexColor('#BFDBFE')),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))

        # Payment Terms & Bank Instructions
        terms_html = f"""
        <b>PAYMENT MILESTONES:</b><br/>
        • <b>50% Advance Token:</b> At booking & 3D material finalization.<br/>
        • <b>40% Stage Payment:</b> Upon delivery of modular carcasses at site.<br/>
        • <b>10% Final Settlement:</b> Handover, snagging completion & key handover.<br/><br/>
        <b>BANK / UPI PAYMENT INSTRUCTIONS:</b><br/>
        <b>Bank:</b> {bank_name} &nbsp;|&nbsp; <b>A/C No:</b> {bank_acc}<br/>
        <b>IFSC:</b> {bank_ifsc} &nbsp;|&nbsp; <b>UPI ID:</b> {bank_upi}
        """

        summary_wrapper = Table([
            [
                Paragraph(terms_html, style_terms),
                totals_table
            ]
        ], colWidths=[3.5 * inch, 4.0 * inch])

        summary_wrapper.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 0),
        ]))

        story.append(KeepTogether([
            summary_wrapper,
            Spacer(1, 6),
            # Amount in Words Box
            Table([
                [Paragraph(f"<b>Amount in Words:</b> {amount_to_words_inr(total_val)}", style_card_title)]
            ], colWidths=[7.5 * inch], style=[
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
                ('PADDING', (0,0), (-1,-1), 5),
            ])
        ]))

        story.append(Spacer(1, 8))

        # ----------------------------------------------------------------------
        # Warranty, Terms & Dual Acceptance Signature Block
        # ----------------------------------------------------------------------
        warranty_text = (
            "<b>WARRANTY & TERMS:</b> 10-Year warranty on Century/TESA BWP carcasses against borer/termites. "
            "Lifetime manufacturer replacement warranty on soft-close Hafele/Hettich hinges. "
            "Any civil or structural alterations outside the BOQ scope will be billed under separate approved change orders."
        )

        signatures_content = [
            Paragraph(warranty_text, style_terms),
            Spacer(1, 14),
            Table([
                [
                    Paragraph(
                        "__________________________________________<br/>"
                        f"<b>CLIENT ACCEPTANCE & CONFIRMATION</b><br/>"
                        f"Name: {client_name}<br/>"
                        "Date: ____ / ____ / ________",
                        style_terms
                    ),
                    Paragraph(
                        "__________________________________________<br/>"
                        f"<b>FOR {studio_name}</b><br/>"
                        "Authorized Studio Signatory<br/>"
                        f"Date: {date_str}",
                        style_terms
                    )
                ]
            ], colWidths=[3.75 * inch, 3.75 * inch], style=[
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('PADDING', (0,0), (-1,-1), 0),
            ])
        ]

        story.append(KeepTogether(signatures_content))

        # Build document with dynamic NumberedCanvas
        doc.build(story, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer.getvalue()
