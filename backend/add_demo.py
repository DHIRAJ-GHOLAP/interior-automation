import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from datetime import datetime, timezone
from app.database import SessionLocal
from app.models import Client, Project, Room, Measurement, Material, BOQItem, WhatsAppLog
from app.services.calculation import CalculationEngine
from app.services.quotation import QuotationService
from app.services.followup import FollowUpEngine

def create_demo():
    db = SessionLocal()
    try:
        # Check if already exists
        existing = db.query(Client).filter(Client.phone == "9820198201").first()
        if existing:
            print(f"Client already exists with ID: {existing.id}. Deleting existing demo to refresh cleanly.")
            db.delete(existing)
            db.commit()

        # Fetch materials map
        materials = {m.name: m for m in db.query(Material).all()}

        # 1. Create Demo Client
        client = Client(
            name="Vikram & Ananya Mehta",
            phone="9820198201",
            whatsapp="9820198201",
            email="vikram.mehta@mumbaiinteriors.demo",
            address="Flat 1402, Lodha Bellissimo, Mahalaxmi",
            city="South Mumbai",
            notes="VIP Client • 3BHK Turnkey Interior. Modern minimalist theme with natural teak fluted paneling, PU media console, high-gloss acrylic modular kitchen, and custom master wardrobe."
        )
        db.add(client)
        db.commit()
        db.refresh(client)
        print(f"✅ Created Client: {client.name} (ID: {client.id})")

        # 2. Create Project
        project = Project(
            client_id=client.id,
            name="3BHK Lodha Bellissimo Luxury Haven",
            property_type="3BHK",
            location="Mahalaxmi, South Mumbai",
            carpet_area=1450.0,
            number_of_rooms=4,
            start_date="2026-10-10",
            expected_completion="2027-01-20",
            status="Quotation Sent",
            estimated_budget=2200000.0
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        print(f"✅ Created Project: {project.name} (ID: {project.id})")

        # 3. Create Rooms
        room1 = Room(project_id=project.id, name="Living & Dining Lounge", floor="14th Floor")
        room2 = Room(project_id=project.id, name="Master Bedroom Suite", floor="14th Floor")
        room3 = Room(project_id=project.id, name="Gourmet Modular Kitchen", floor="14th Floor")
        db.add_all([room1, room2, room3])
        db.commit()
        db.refresh(room1)
        db.refresh(room2)
        db.refresh(room3)

        # Measurements Room 1
        m1 = Measurement(room_id=room1.id, label="Main TV Console Feature Wall", height=9.5, width=14.0, length=0.0, unit="FT", calculated_sqft=133.0, notes="9.5 ft height x 14 ft width")
        m2 = Measurement(room_id=room1.id, label="Fluted Teak Accent Paneling", height=9.5, width=8.0, length=0.0, unit="FT", calculated_sqft=76.0, notes="Wall panelling behind lounge")
        m3 = Measurement(room_id=room1.id, label="False Ceiling & Perimeter Cove", height=0.0, width=15.0, length=22.0, unit="FT", calculated_sqft=330.0, notes="Gypsum board ceiling grid")
        db.add_all([m1, m2, m3])

        # Measurements Room 2
        m4 = Measurement(room_id=room2.id, label="Floor-to-Ceiling Wardrobe Wall", height=9.5, width=10.0, length=0.0, unit="FT", calculated_sqft=95.0, notes="Sliding wardrobe alcove")
        m5 = Measurement(room_id=room2.id, label="Acoustic Bed Headboard Paneling", height=5.0, width=9.0, length=0.0, unit="FT", calculated_sqft=45.0, notes="King size bed back wall")
        db.add_all([m4, m5])

        # Measurements Room 3
        m6 = Measurement(room_id=room3.id, label="Base Kitchen Counters (L-Shape)", height=2.8, width=0.0, length=16.0, unit="FT", calculated_sqft=44.8, notes="Counter base depth 2ft")
        m7 = Measurement(room_id=room3.id, label="Overhead Wall Cabinets", height=2.5, width=0.0, length=14.0, unit="FT", calculated_sqft=35.0, notes="Lift-up hydraulic units")
        db.add_all([m6, m7])
        db.commit()

        # BOQ Items Helper
        def add_boq(room, title, mat_name, calc_type, h, w, l, mult, unit, wastage_pct, pur_rate, client_rate):
            mat = materials.get(mat_name)
            mat_id = mat.id if mat else None
            net_qty = CalculationEngine.calculate_dimensions(calc_type, h, w, l, mult, "FT")
            wastage_qty, chargeable_qty = CalculationEngine.apply_wastage(net_qty, wastage_pct)
            total_cost, total_amount, gross_margin, margin_pct = CalculationEngine.calculate_item_financials(
                chargeable_qty, pur_rate, client_rate
            )
            item = BOQItem(
                room_id=room.id,
                material_id=mat_id,
                item_title=title,
                category=mat.category if mat else "Custom",
                calculation_type=calc_type,
                height=h,
                width=w,
                length=l,
                multiplier=mult,
                net_quantity=net_qty,
                wastage_percent=wastage_pct,
                chargeable_quantity=chargeable_qty,
                unit=unit,
                purchase_rate=pur_rate,
                client_rate=client_rate,
                total_cost=total_cost,
                total_amount=total_amount,
                gross_margin=gross_margin
            )
            db.add(item)
            return item

        # Room 1 BOQ
        add_boq(room1, "18mm HDHMR TV Console Unit", "18mm HDHMR Water Resistant", "AREA", 9.5, 14.0, 0, 1.0, "SQFT", 10.0, 110.0, 220.0)
        add_boq(room1, "Natural Teak Fluted Veneer Feature Wall", "Natural Teak Decorative Veneer", "AREA", 9.5, 8.0, 0, 1.0, "SQFT", 12.0, 110.0, 240.0)
        add_boq(room1, "Gypsum False Ceiling Grid with Cove", "Gypsum Board False Ceiling with Channel Grid", "AREA", 15.0, 22.0, 0, 1.0, "SQFT", 10.0, 65.0, 130.0)
        add_boq(room1, "Philips Warm White Concealed LED Strip", "Concealed Warm White LED Profile Light (Cove)", "RUNNING_FT", 0, 0, 74.0, 1.0, "RUNNING_FT", 5.0, 80.0, 180.0)

        # Room 2 BOQ
        add_boq(room2, "18mm BWP Marine Plywood Sliding Wardrobe", "18mm BWP Plywood 710", "AREA", 9.5, 10.0, 0, 1.0, "SQFT", 10.0, 120.0, 260.0)
        add_boq(room2, "8mm Fluted Toughened Glass Shutter Insert", "8mm Toughened Fluted Glass", "AREA", 9.5, 4.0, 0, 1.0, "SQFT", 5.0, 160.0, 320.0)
        add_boq(room2, "1mm Internal Decorative Laminate Carcass Finish", "1mm Decorative Laminate (Suede/Matte)", "AREA", 9.5, 20.0, 0, 1.0, "SQFT", 8.0, 60.0, 110.0)
        add_boq(room2, "Hafele Heavy Duty Telescopic Channels", "Telescopic Soft-Close Channels (18 inch)", "PIECES", 0, 0, 0, 6.0, "SET", 0.0, 280.0, 650.0)

        # Room 3 BOQ
        add_boq(room3, "18mm HDHMR Water Resistant Kitchen Carcass", "18mm HDHMR Water Resistant", "AREA", 2.8, 16.0, 0, 1.0, "SQFT", 10.0, 110.0, 240.0)
        add_boq(room3, "2mm High Gloss Anti-Scratch Acrylic Shutters", "2mm High Gloss Acrylic Sheet", "AREA", 2.8, 16.0, 0, 1.0, "SQFT", 7.0, 130.0, 280.0)
        add_boq(room3, "Hettich Soft-Close Clip-on Hinges", "Soft Close Clip-on Hinges (Crank 0/8/16)", "PIECES", 0, 0, 0, 16.0, "PIECE", 0.0, 95.0, 220.0)
        add_boq(room3, "Hafele Concealed Matt Black Profile Gola Handles", "Concealed Aluminum Profile Handles (Gola/J-Pull)", "PIECES", 0, 0, 0, 8.0, "PIECE", 0.0, 140.0, 350.0)

        db.commit()
        print("✅ Added Rooms, Measurements & BOQ items.")

        # 4. Generate Quotation
        quotation = QuotationService.generate_from_boq(
            db=db,
            project_id=project.id,
            discount_amount=25000.0,
            tax_percent=18.0,
            notes="Comprehensive turnkey 3BHK interior proposal for Lodha Bellissimo, Mahalaxmi.",
            terms="50% Advance booking token, 40% on modular carcass delivery, 10% on final handover & snagging."
        )
        print(f"✅ Generated Quotation: {quotation.quotation_number} (Amount: ₹{quotation.total_amount:,.2f}, Token: {quotation.public_token})")

        # 5. Log Initial WhatsApp Message
        wa_log = WhatsAppLog(
            client_id=client.id,
            quotation_id=quotation.id,
            recipient_phone=client.whatsapp,
            message_type="Quotation Shared",
            message_body=f"Namaste Mr. & Mrs. Mehta! Here is your bespoke interior quotation {quotation.quotation_number} for Lodha Bellissimo: http://localhost:8000/quote/{quotation.public_token}",
            status="Delivered"
        )
        db.add(wa_log)
        db.commit()
        print(f"✅ Logged WhatsApp Message with Portal URL")

        print("\n🎉 Demo Client Successfully Created!")
        print(f"• Client: {client.name} ({client.phone})")
        print(f"• Project: {project.name}")
        print(f"• Quote: {quotation.quotation_number}")
        print(f"• Total Value: ₹{quotation.total_amount:,.2f}")
        print(f"• Portal URL: http://localhost:8000/quote/{quotation.public_token}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating demo: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    create_demo()
