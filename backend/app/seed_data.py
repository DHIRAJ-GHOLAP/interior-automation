from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from .database import engine, Base
from .models import Client, Project, Room, Measurement, Material, BOQItem, Quotation, QuotationItem, FollowUp, WhatsAppLog

def seed_database(db: Session):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    if db.query(Material).count() > 0:
        return # Already seeded

    materials_catalog = [
        # Plywood & Boards
        Material(name="18mm BWP Plywood 710", category="Plywood", brand="Century", material_type="BWP", grade="710", thickness="18mm", unit="SQFT", purchase_cost=120.0, client_rate=145.0, default_wastage_percent=10.0),
        Material(name="12mm MR Plywood 303", category="Plywood", brand="Century", material_type="MR", grade="303", thickness="12mm", unit="SQFT", purchase_cost=75.0, client_rate=95.0, default_wastage_percent=10.0),
        Material(name="18mm HDHMR Water Resistant", category="Plywood", brand="Action TESA", material_type="HDHMR", grade="High Density", thickness="18mm", unit="SQFT", purchase_cost=110.0, client_rate=150.0, default_wastage_percent=10.0),
        
        # Surfaces & Finishes
        Material(name="1mm Decorative Laminate (Suede/Matte)", category="Laminate", brand="Merino", material_type="Laminate", grade="1mm", thickness="1mm", unit="SQFT", purchase_cost=60.0, client_rate=95.0, default_wastage_percent=8.0),
        Material(name="2mm High Gloss Acrylic Sheet", category="Acrylic", brand="Euro Pratik", material_type="Acrylic", grade="Anti-scratch", thickness="2mm", unit="SQFT", purchase_cost=130.0, client_rate=190.0, default_wastage_percent=7.0),
        Material(name="Natural Teak Decorative Veneer", category="Veneer", brand="Timex", material_type="Veneer", grade="Grade A", thickness="4mm", unit="SQFT", purchase_cost=110.0, client_rate=210.0, default_wastage_percent=12.0),
        Material(name="8mm Toughened Fluted Glass", category="Glass", brand="Saint Gobain", material_type="Toughened Glass", grade="Fluted", thickness="8mm", unit="SQFT", purchase_cost=160.0, client_rate=240.0, default_wastage_percent=5.0),
        Material(name="2mm PVC Edge Banding Tape", category="Edge Band", brand="Rehau", material_type="PVC", grade="Premium", thickness="2mm", unit="RUNNING_FT", purchase_cost=8.0, client_rate=18.0, default_wastage_percent=5.0),

        # Hardware & Fittings
        Material(name="Soft Close Clip-on Hinges (Crank 0/8/16)", category="Hardware", brand="Hettich", material_type="Nickel Plated", grade="Intermat", thickness="Standard", unit="PIECE", purchase_cost=95.0, client_rate=180.0, default_wastage_percent=0.0),
        Material(name="Telescopic Soft-Close Channels (18 inch)", category="Hardware", brand="Hafele", material_type="Steel Ball Bearing", grade="Heavy Duty", thickness="18 inch", unit="SET", purchase_cost=280.0, client_rate=550.0, default_wastage_percent=0.0),
        Material(name="Concealed Aluminum Profile Handles (Gola/J-Pull)", category="Hardware", brand="Hafele", material_type="Anodized Aluminum", grade="Matt Black", thickness="3 meter", unit="PIECE", purchase_cost=140.0, client_rate=250.0, default_wastage_percent=0.0),

        # Ceiling & Wall Paints
        Material(name="Gypsum Board False Ceiling with Channel Grid", category="False Ceiling", brand="Saint Gobain", material_type="Gyproc", grade="Fire & Moisture", thickness="12.5mm", unit="SQFT", purchase_cost=65.0, client_rate=110.0, default_wastage_percent=10.0),
        Material(name="Royale Luxury Emulsion (Lappam + 2 Coats Paint)", category="Paint", brand="Asian Paints", material_type="Acrylic Emulsion", grade="Teflon", thickness="2 coats", unit="SQFT", purchase_cost=28.0, client_rate=45.0, default_wastage_percent=10.0),
        Material(name="Concealed Warm White LED Profile Light (Cove)", category="Electrical", brand="Philips", material_type="Alu Profile + 240 LED/m", grade="IP20", thickness="17x15mm", unit="RUNNING_FT", purchase_cost=80.0, client_rate=160.0, default_wastage_percent=5.0),
    ]

    for m in materials_catalog:
        db.add(m)
    db.commit()

    # 1. Client Rahul Sharma
    client_rahul = Client(
        name="Rahul Sharma",
        phone="9876543210",
        whatsapp="9876543210",
        email="rahul.sharma@gmail.com",
        address="Flat 702, Godrej Riverside, Khadakpada",
        city="Kalyan",
        notes="Referred by Manoj. Looking for complete 2BHK modern minimalist interior."
    )
    # 2. Client Sneha Patil
    client_sneha = Client(
        name="Sneha Patil",
        phone="9823456781",
        whatsapp="9823456781",
        email="sneha.patil@outlook.com",
        address="B-1204, Hiranandani Meadows, Ghodbunder Rd",
        city="Thane",
        notes="3BHK interior renovation. Budget around 18-20 Lakhs."
    )
    # 3. Client Amit Shah
    client_amit = Client(
        name="Amit Shah",
        phone="9712345678",
        whatsapp="9712345678",
        email="amit.shah@shahconsultants.com",
        address="401, Lotus Business Park",
        city="Andheri West",
        notes="Commercial office space, 12 workstations + conference room."
    )
    db.add_all([client_rahul, client_sneha, client_amit])
    db.commit()

    # Create Projects
    proj_rahul = Project(
        client_id=client_rahul.id,
        name="2BHK Kalyan Interior",
        property_type="2BHK",
        location="Khadakpada, Kalyan West",
        carpet_area=780.0,
        number_of_rooms=4,
        start_date="2026-10-15",
        expected_completion="2026-12-30",
        status="Quotation Sent",
        estimated_budget=1050000.0
    )
    proj_sneha = Project(
        client_id=client_sneha.id,
        name="3BHK Hiranandani Renovation",
        property_type="3BHK",
        location="Ghodbunder Road, Thane",
        carpet_area=1250.0,
        number_of_rooms=5,
        start_date="2026-11-01",
        expected_completion="2027-02-15",
        status="Follow-up",
        estimated_budget=1900000.0
    )
    proj_amit = Project(
        client_id=client_amit.id,
        name="Office Corporate Fitout",
        property_type="Commercial Office",
        location="Andheri West, Mumbai",
        carpet_area=950.0,
        number_of_rooms=3,
        start_date="2026-10-01",
        expected_completion="2026-11-20",
        status="Negotiation",
        estimated_budget=1400000.0
    )
    db.add_all([proj_rahul, proj_sneha, proj_amit])
    db.commit()

    # Rooms for Rahul's 2BHK
    r_living = Room(project_id=proj_rahul.id, name="Living Room", floor="Level 7")
    r_kitchen = Room(project_id=proj_rahul.id, name="Kitchen", floor="Level 7")
    r_bed1 = Room(project_id=proj_rahul.id, name="Bedroom 1 (Master)", floor="Level 7")
    r_bed2 = Room(project_id=proj_rahul.id, name="Bedroom 2 (Guest)", floor="Level 7")
    r_ceiling = Room(project_id=proj_rahul.id, name="False Ceiling & Electrical", floor="Level 7")
    db.add_all([r_living, r_kitchen, r_bed1, r_bed2, r_ceiling])
    db.commit()

    # Measurements for Bedroom 1
    m1 = Measurement(room_id=r_bed1.id, label="Wall A (Wardrobe Wall)", height=8.5, width=9.0, calculated_sqft=76.5, notes="Full height sliding wardrobe space")
    m2 = Measurement(room_id=r_bed1.id, label="Wall B (Bed Headboard Wall)", height=8.5, width=12.0, calculated_sqft=102.0, notes="Acoustic paneling + 2 side tables")
    # Measurements for Living Room
    m3 = Measurement(room_id=r_living.id, label="TV Unit Feature Wall", height=9.0, width=11.5, calculated_sqft=103.5, notes="Fluted paneling + floating console")
    db.add_all([m1, m2, m3])
    db.commit()

    # Find materials for BOQ
    plywood = db.query(Material).filter(Material.name.like("%18mm BWP%")).first()
    laminate = db.query(Material).filter(Material.name.like("%1mm Decorative%")).first()
    edge_band = db.query(Material).filter(Material.name.like("%PVC Edge%")).first()
    hinges = db.query(Material).filter(Material.name.like("%Hinges%")).first()
    handles = db.query(Material).filter(Material.name.like("%Handles%")).first()
    ceiling_mat = db.query(Material).filter(Material.name.like("%Gypsum%")).first()

    # Kitchen BOQ Items (as specified in user prompt Section 7 & 8)
    # Kitchen: 18mm BWP Plywood 420 sq.ft @ ₹145 = ₹60,900
    # Laminate 380 sq.ft @ ₹95 = ₹36,100
    # Edge Band 145 ft @ ₹18 = ₹2,610
    # Hinges 24 pcs @ ₹180 = ₹4,320
    # Handles 12 pcs @ ₹250 = ₹3,000
    # Subtotal = ₹1,06,930
    boq_k1 = BOQItem(
        room_id=r_kitchen.id,
        material_id=plywood.id if plywood else None,
        item_title="Base & Wall Cabinets Box Structure",
        category="Cabinetry",
        calculation_type="AREA",
        net_quantity=381.8,
        unit="SQFT",
        wastage_percent=10.0,
        chargeable_quantity=420.0,
        purchase_rate=120.0,
        client_rate=145.0,
        total_cost=50400.0,
        total_amount=60900.0,
        gross_margin=10500.0
    )
    boq_k2 = BOQItem(
        room_id=r_kitchen.id,
        material_id=laminate.id if laminate else None,
        item_title="Cabinet Shutters Outer & Inner Laminate",
        category="Finishes",
        calculation_type="AREA",
        net_quantity=351.85,
        unit="SQFT",
        wastage_percent=8.0,
        chargeable_quantity=380.0,
        purchase_rate=60.0,
        client_rate=95.0,
        total_cost=22800.0,
        total_amount=36100.0,
        gross_margin=13300.0
    )
    boq_k3 = BOQItem(
        room_id=r_kitchen.id,
        material_id=edge_band.id if edge_band else None,
        item_title="2mm Machine Edge Banding",
        category="Finishes",
        calculation_type="RUNNING_FT",
        net_quantity=138.0,
        unit="RUNNING_FT",
        wastage_percent=5.0,
        chargeable_quantity=145.0,
        purchase_rate=8.0,
        client_rate=18.0,
        total_cost=1160.0,
        total_amount=2610.0,
        gross_margin=1450.0
    )
    boq_k4 = BOQItem(
        room_id=r_kitchen.id,
        material_id=hinges.id if hinges else None,
        item_title="Soft Close Clip-on Hinges",
        category="Hardware",
        calculation_type="PIECES",
        net_quantity=24.0,
        unit="PIECE",
        wastage_percent=0.0,
        chargeable_quantity=24.0,
        purchase_rate=95.0,
        client_rate=180.0,
        total_cost=2280.0,
        total_amount=4320.0,
        gross_margin=2040.0
    )
    boq_k5 = BOQItem(
        room_id=r_kitchen.id,
        material_id=handles.id if handles else None,
        item_title="Hafele Concealed Edge Profile Handles",
        category="Hardware",
        calculation_type="PIECES",
        net_quantity=12.0,
        unit="PIECE",
        wastage_percent=0.0,
        chargeable_quantity=12.0,
        purchase_rate=140.0,
        client_rate=250.0,
        total_cost=1680.0,
        total_amount=3000.0,
        gross_margin=1320.0
    )
    db.add_all([boq_k1, boq_k2, boq_k3, boq_k4, boq_k5])

    # Living Room Items (TV Unit, Wall Panel, etc. = ₹1,85,000)
    boq_l1 = BOQItem(
        room_id=r_living.id,
        material_id=plywood.id if plywood else None,
        item_title="Designer TV Console & Fluted Back Panel",
        category="Furniture",
        calculation_type="FIXED",
        net_quantity=1.0,
        unit="LOT",
        wastage_percent=0.0,
        chargeable_quantity=1.0,
        purchase_rate=85000.0,
        client_rate=185000.0,
        total_cost=85000.0,
        total_amount=185000.0,
        gross_margin=100000.0
    )
    # Master Bedroom (Wardrobe + Bed Back = ₹1,75,000)
    boq_b1 = BOQItem(
        room_id=r_bed1.id,
        material_id=plywood.id if plywood else None,
        item_title="Master Wardrobe 8.5ft x 9ft with Soft Close Sliding Doors",
        category="Wardrobe",
        calculation_type="FIXED",
        net_quantity=1.0,
        unit="LOT",
        wastage_percent=0.0,
        chargeable_quantity=1.0,
        purchase_rate=98000.0,
        client_rate=175000.0,
        total_cost=98000.0,
        total_amount=175000.0,
        gross_margin=77000.0
    )
    # Guest Bedroom (Wardrobe = ₹1,35,000)
    boq_b2 = BOQItem(
        room_id=r_bed2.id,
        material_id=plywood.id if plywood else None,
        item_title="Guest Bedroom Wardrobe with Open Study Niche",
        category="Wardrobe",
        calculation_type="FIXED",
        net_quantity=1.0,
        unit="LOT",
        wastage_percent=0.0,
        chargeable_quantity=1.0,
        purchase_rate=78000.0,
        client_rate=135000.0,
        total_cost=78000.0,
        total_amount=135000.0,
        gross_margin=57000.0
    )
    # False Ceiling = ₹80,000
    boq_fc = BOQItem(
        room_id=r_ceiling.id,
        material_id=ceiling_mat.id if ceiling_mat else None,
        item_title="Saint Gobain Gyproc False Ceiling with Cove Lighting Grid",
        category="Ceiling",
        calculation_type="AREA",
        net_quantity=660.0,
        unit="SQFT",
        wastage_percent=10.0,
        chargeable_quantity=727.27,
        purchase_rate=65.0,
        client_rate=110.0,
        total_cost=47272.55,
        total_amount=80000.0,
        gross_margin=32727.45
    )
    # Kitchen additional counter/granite top package = ₹2,13,070 to reach ₹3,20,000 Kitchen total
    boq_k_ext = BOQItem(
        room_id=r_kitchen.id,
        material_id=None,
        item_title="Quartz Countertop & Tandem Box Drawer System",
        category="Cabinetry",
        calculation_type="FIXED",
        net_quantity=1.0,
        unit="LOT",
        wastage_percent=0.0,
        chargeable_quantity=1.0,
        purchase_rate=125000.0,
        client_rate=213070.0,
        total_cost=125000.0,
        total_amount=213070.0,
        gross_margin=88070.0
    )
    db.add_all([boq_l1, boq_b1, boq_b2, boq_fc, boq_k_ext])
    db.commit()

    # Pre-generate Quotation #INT-2026-0047 (as specified in user prompt Section 10)
    # Subtotal: ₹8,95,000
    # Discount: ₹25,000
    # Net: ₹8,70,000
    # Tax (18%): ₹1,56,600
    # Total: ₹10,26,600
    total_cost_sum = 50400 + 22800 + 1160 + 2280 + 1680 + 85000 + 98000 + 78000 + 47272.55 + 125000
    gross_margin_sum = 1026600.0 - total_cost_sum

    quote_0047 = Quotation(
        project_id=proj_rahul.id,
        quotation_number="INT-2026-0047",
        version="R0",
        status="Quotation Sent",
        subtotal=895000.0,
        discount_amount=25000.0,
        tax_percent=18.0,
        tax_amount=156600.0,
        total_amount=1026600.0,
        total_cost=round(total_cost_sum, 2),
        gross_margin=round(gross_margin_sum, 2),
        margin_percent=round((gross_margin_sum / 1026600.0) * 100.0, 1),
        valid_until="15 Oct 2026",
        notes="Turnkey 2BHK Interior proposal including modular kitchen, wardrobes, false ceiling, and designer TV wall.",
        terms="50% Advance at project signoff, 40% on material delivery, 10% on handover.",
        sent_at=datetime.now(timezone.utc) - timedelta(days=2)
    )
    db.add(quote_0047)
    db.commit()

    # Quotation Items for #INT-2026-0047
    q_items = [
        QuotationItem(
            quotation_id=quote_0047.id,
            room_name="Living Room",
            item_title="Designer TV Console & Fluted Back Panel",
            material_spec="Century 18mm BWP Plywood + 1mm Merino Laminate + Warm LED",
            quantity=1.0,
            unit="LOT",
            rate=185000.0,
            amount=185000.0,
            unit_cost=85000.0,
            total_cost=85000.0
        ),
        QuotationItem(
            quotation_id=quote_0047.id,
            room_name="Kitchen",
            item_title="Complete Modular Kitchen (Base + Wall + Quartz Counter)",
            material_spec="Century 18mm BWP 710 Plywood, Hafele Soft Close Hardware, 2mm Edge Band",
            quantity=1.0,
            unit="LOT",
            rate=320000.0,
            amount=320000.0,
            unit_cost=203320.0,
            total_cost=203320.0
        ),
        QuotationItem(
            quotation_id=quote_0047.id,
            room_name="Bedroom 1",
            item_title="Master Wardrobe 8.5ft x 9ft with Soft Close Sliding Doors",
            material_spec="Action TESA 18mm HDHMR + Merino Laminate + Hafele Sliding Channels",
            quantity=1.0,
            unit="LOT",
            rate=175000.0,
            amount=175000.0,
            unit_cost=98000.0,
            total_cost=98000.0
        ),
        QuotationItem(
            quotation_id=quote_0047.id,
            room_name="Bedroom 2",
            item_title="Guest Bedroom Wardrobe with Open Study Niche",
            material_spec="Century 18mm MR Plywood + Matte Finish Laminate",
            quantity=1.0,
            unit="LOT",
            rate=135000.0,
            amount=135000.0,
            unit_cost=78000.0,
            total_cost=78000.0
        ),
        QuotationItem(
            quotation_id=quote_0047.id,
            room_name="False Ceiling",
            item_title="Designer Gyproc Ceiling with Indirect Cove Profile Light Grid",
            material_spec="Saint Gobain Gypsum Board + Philips LED Warm Cove",
            quantity=727.0,
            unit="SQFT",
            rate=110.0,
            amount=80000.0,
            unit_cost=65.0,
            total_cost=47272.55
        ),
    ]
    db.add_all(q_items)
    db.commit()

    # Pre-seed Follow-ups for Rahul Sharma (Day 2 follow-up due TODAY!)
    now = datetime.now(timezone.utc)
    fu1 = FollowUp(
        quotation_id=quote_0047.id,
        client_id=client_rahul.id,
        step_number=1,
        scheduled_for=now - timedelta(hours=2), # Due today!
        status="Pending",
        channel="WhatsApp",
        notes="Follow-up #1: Friendly check-in. Rahul reviewed quotation 2 days ago."
    )
    fu2 = FollowUp(
        quotation_id=quote_0047.id,
        client_id=client_rahul.id,
        step_number=2,
        scheduled_for=now + timedelta(days=3),
        status="Pending",
        channel="WhatsApp",
        notes="Follow-up #2: Material sample consultation & 3D preview."
    )
    fu3 = FollowUp(
        quotation_id=quote_0047.id,
        client_id=client_rahul.id,
        step_number=3,
        scheduled_for=now + timedelta(days=8),
        status="Pending",
        channel="WhatsApp",
        notes="Final follow-up before closing quotation validity."
    )
    db.add_all([fu1, fu2, fu3])

    # Pre-seed WhatsApp log
    wa_init = WhatsAppLog(
        quotation_id=quote_0047.id,
        client_id=client_rahul.id,
        recipient_phone=client_rahul.whatsapp,
        message_type="Quotation",
        message_body=(
            f"Hello Rahul Sharma, your interior quotation has been prepared.\n\n"
            f"📄 Quotation No: INT-2026-0047\n"
            f"🏠 Project: 2BHK Kalyan Interior\n"
            f"💰 Amount: ₹10,26,600\n\n"
            f"Please review your quotation here: /quote/{quote_0047.public_token}"
        ),
        status="Delivered",
        created_at=now - timedelta(days=2)
    )
    db.add(wa_init)
    db.commit()
    print("Pre-seeded database successfully!")
