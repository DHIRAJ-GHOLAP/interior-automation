import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import Material, Client, Project, Room, BOQItem, Quotation, QuotationItem
from app.services.calculation import CalculationEngine

def seed_construction():
    db = SessionLocal()
    try:
        print("Checking existing materials...")
        existing_names = set(m.name for m in db.query(Material).all())

        new_materials = [
            # 1. Civil & Structural
            Material(
                name="UltraTech Super Cement (50kg Bag)",
                category="Civil & Structural",
                brand="UltraTech",
                material_type="Cement",
                grade="OPC 53 Grade",
                thickness="50kg Bag",
                unit="BAG",
                purchase_cost=340.0,
                client_rate=395.0,
                default_wastage_percent=2.0
            ),
            Material(
                name="Ambuja Kawach Water-Shield Cement (50kg Bag)",
                category="Civil & Structural",
                brand="Ambuja",
                material_type="Cement",
                grade="Water Repellent PPC",
                thickness="50kg Bag",
                unit="BAG",
                purchase_cost=360.0,
                client_rate=420.0,
                default_wastage_percent=2.0
            ),
            Material(
                name="Tata Tiscon 550D High Ductile TMT Rebar",
                category="Civil & Structural",
                brand="Tata Tiscon",
                material_type="TMT Steel",
                grade="Fe 550D",
                thickness="12mm - 20mm",
                unit="KG",
                purchase_cost=68.0,
                client_rate=82.0,
                default_wastage_percent=4.0
            ),
            Material(
                name="Jindal Panther 550D TMT Stirrup Steel",
                category="Civil & Structural",
                brand="Jindal",
                material_type="TMT Steel",
                grade="Fe 550D",
                thickness="8mm - 10mm",
                unit="KG",
                purchase_cost=65.0,
                client_rate=79.0,
                default_wastage_percent=4.0
            ),
            Material(
                name="Ready Mix Concrete (RMC) M25 Grade",
                category="Civil & Structural",
                brand="ACC / UltraTech",
                material_type="RMC Concrete",
                grade="M25 Design Mix",
                thickness="Standard",
                unit="CFT",
                purchase_cost=165.0,
                client_rate=210.0,
                default_wastage_percent=3.0
            ),
            Material(
                name="River Sand / Washed Plaster Sand",
                category="Civil & Structural",
                brand="Certified Source",
                material_type="Fine Aggregate",
                grade="Zone II",
                thickness="Silt < 3%",
                unit="BRASS",
                purchase_cost=6800.0,
                client_rate=8500.0,
                default_wastage_percent=5.0
            ),
            Material(
                name="VSI Manufactured Sand (M-Sand) for Concrete",
                category="Civil & Structural",
                brand="RoboSilicon",
                material_type="Crushed Sand",
                grade="Graded M-Sand",
                thickness="Zone II",
                unit="BRASS",
                purchase_cost=4200.0,
                client_rate=5400.0,
                default_wastage_percent=3.0
            ),
            Material(
                name="Crushed Basalt Stone Aggregate (20mm Metal)",
                category="Civil & Structural",
                brand="Quarry Graded",
                material_type="Coarse Aggregate",
                grade="20mm Angular",
                thickness="20mm",
                unit="BRASS",
                purchase_cost=3600.0,
                client_rate=4600.0,
                default_wastage_percent=3.0
            ),
            Material(
                name="Crushed Basalt Stone Aggregate (10mm Metal)",
                category="Civil & Structural",
                brand="Quarry Graded",
                material_type="Coarse Aggregate",
                grade="10mm Angular",
                thickness="10mm",
                unit="BRASS",
                purchase_cost=3800.0,
                client_rate=4800.0,
                default_wastage_percent=3.0
            ),

            # 2. Masonry & Bricks
            Material(
                name="First Class Table Molded Red Clay Bricks",
                category="Masonry & Bricks",
                brand="Kiln Standard",
                material_type="Red Clay Brick",
                grade="Class 10.5 N/mm2",
                thickness="9x4x3 inch",
                unit="PIECE",
                purchase_cost=8.5,
                client_rate=12.5,
                default_wastage_percent=5.0
            ),
            Material(
                name="Siporex / Magicrete AAC Lightweight Blocks",
                category="Masonry & Bricks",
                brand="Siporex",
                material_type="AAC Block",
                grade="Grade 1 IS:2185",
                thickness="600x200x150mm",
                unit="PIECE",
                purchase_cost=62.0,
                client_rate=88.0,
                default_wastage_percent=3.0
            ),
            Material(
                name="UltraTech Fixoblock Block Jointing Mortar (40kg)",
                category="Masonry & Bricks",
                brand="UltraTech",
                material_type="Polymer Mortar",
                grade="Thin-Bed",
                thickness="3mm joint",
                unit="BAG",
                purchase_cost=310.0,
                client_rate=420.0,
                default_wastage_percent=3.0
            ),

            # 3. Plaster & Gypsum
            Material(
                name="Saint-Gobain Gyproc Elite OneCoat Gypsum Plaster",
                category="Plaster & Gypsum",
                brand="Saint-Gobain",
                material_type="Gypsum Plaster",
                grade="OneCoat Elite",
                thickness="12-15mm",
                unit="SQFT",
                purchase_cost=28.0,
                client_rate=48.0,
                default_wastage_percent=5.0
            ),
            Material(
                name="External Sand Face Double Coat Cement Plaster (20mm)",
                category="Plaster & Gypsum",
                brand="Site Prepared 1:4",
                material_type="Cement Plaster",
                grade="Waterproofed with Dr. Fixit",
                thickness="20mm",
                unit="SQFT",
                purchase_cost=35.0,
                client_rate=58.0,
                default_wastage_percent=5.0
            ),

            # 4. Waterproofing
            Material(
                name="Dr. Fixit Pidifin 2K Polymer Acrylic Waterproofing",
                category="Waterproofing",
                brand="Pidilite / Dr. Fixit",
                material_type="Polymer Coating",
                grade="2K Elastomeric",
                thickness="2 Coats",
                unit="SQFT",
                purchase_cost=26.0,
                client_rate=46.0,
                default_wastage_percent=5.0
            ),
            Material(
                name="Fosroc Nitocote CM210 Flexible Waterproof Slurry",
                category="Waterproofing",
                brand="Fosroc",
                material_type="Flexible Slurry",
                grade="CM210",
                thickness="2 Coats",
                unit="SQFT",
                purchase_cost=32.0,
                client_rate=55.0,
                default_wastage_percent=5.0
            ),

            # 5. Flooring & Tiling
            Material(
                name="Kajaria 1200x600mm Glazed Vitrified Tiles (GVT)",
                category="Flooring & Tiling",
                brand="Kajaria",
                material_type="Vitrified Tile",
                grade="Polished GVT",
                thickness="9mm",
                unit="SQFT",
                purchase_cost=65.0,
                client_rate=110.0,
                default_wastage_percent=8.0
            ),
            Material(
                name="Somany Anti-Skid Vitrified Ceramic Tiles (600x600mm)",
                category="Flooring & Tiling",
                brand="Somany",
                material_type="Ceramic Vitrified",
                grade="R10 Anti-Skid",
                thickness="9mm",
                unit="SQFT",
                purchase_cost=48.0,
                client_rate=78.0,
                default_wastage_percent=8.0
            ),
            Material(
                name="Imported Italian Marble (Statuario / Dyna White)",
                category="Flooring & Tiling",
                brand="Imported Italian",
                material_type="Natural Marble",
                grade="Gangsaw Slab",
                thickness="18mm",
                unit="SQFT",
                purchase_cost=320.0,
                client_rate=550.0,
                default_wastage_percent=12.0
            ),
            Material(
                name="Jet Black Premium Granite Slabs (Kitchen & Steps)",
                category="Flooring & Tiling",
                brand="South Indian Granite",
                material_type="Granite",
                grade="First Quality",
                thickness="18mm",
                unit="SQFT",
                purchase_cost=110.0,
                client_rate=185.0,
                default_wastage_percent=8.0
            ),
            Material(
                name="Roff T02 Tile On Tile High Strength Adhesive (20kg)",
                category="Flooring & Tiling",
                brand="Pidilite Roff",
                material_type="Polymer Adhesive",
                grade="Type 2",
                thickness="20kg Bag",
                unit="BAG",
                purchase_cost=420.0,
                client_rate=580.0,
                default_wastage_percent=3.0
            ),
            Material(
                name="Laticrete SpectraLOCK Stainproof Epoxy Grout",
                category="Flooring & Tiling",
                brand="Laticrete / MYK",
                material_type="Epoxy Grout",
                grade="100% Solid Epoxy",
                thickness="1kg Kit",
                unit="SET",
                purchase_cost=480.0,
                client_rate=750.0,
                default_wastage_percent=0.0
            ),

            # 6. Plumbing & Sanitary
            Material(
                name="Astral CPVC Pro Heavy Water Supply Pipes (1\" / 3/4\")",
                category="Plumbing & Sanitary",
                brand="Astral",
                material_type="CPVC Schedule 40/80",
                grade="Lead Free NSF-61",
                thickness="3/4 to 1 inch",
                unit="RUNNING_FT",
                purchase_cost=38.0,
                client_rate=65.0,
                default_wastage_percent=5.0
            ),
            Material(
                name="Supreme PVC SWR Ringfit Drainage Pipes (110mm)",
                category="Plumbing & Sanitary",
                brand="Supreme",
                material_type="PVC SWR",
                grade="Type B Heavy",
                thickness="110mm",
                unit="RUNNING_FT",
                purchase_cost=52.0,
                client_rate=85.0,
                default_wastage_percent=5.0
            ),
            Material(
                name="Jaquar Single Lever Concealed Diverter & Overhead Shower",
                category="Plumbing & Sanitary",
                brand="Jaquar",
                material_type="Brass Chrome",
                grade="Vivid Prime",
                thickness="Complete Set",
                unit="SET",
                purchase_cost=4800.0,
                client_rate=7200.0,
                default_wastage_percent=0.0
            ),
            Material(
                name="Kohler Rimless Wall Hung Toilet with Soft-Close Seat",
                category="Plumbing & Sanitary",
                brand="Kohler",
                material_type="Vitreous China",
                grade="Rimless Tornado",
                thickness="Wall Hung",
                unit="SET",
                purchase_cost=14500.0,
                client_rate=21000.0,
                default_wastage_percent=0.0
            ),

            # 7. Electrical & Wiring
            Material(
                name="Polycab FRLS Copper Wires (1.5 / 2.5 / 4.0 sq.mm)",
                category="Electrical",
                brand="Polycab",
                material_type="Copper Conductor",
                grade="FRLS 1100V",
                thickness="Multi-strand",
                unit="RUNNING_FT",
                purchase_cost=18.0,
                client_rate=32.0,
                default_wastage_percent=5.0
            ),
            Material(
                name="Schneider AvatarOn Sleek Frameless Modular Switches",
                category="Electrical",
                brand="Schneider Electric",
                material_type="Polycarbonate",
                grade="AvatarOn",
                thickness="Pure White",
                unit="PIECE",
                purchase_cost=145.0,
                client_rate=240.0,
                default_wastage_percent=0.0
            ),
            Material(
                name="Legrand 12-Way Double Door DB Box with MCBs & RCCB",
                category="Electrical",
                brand="Legrand",
                material_type="Sheet Steel IP43",
                grade="RX3 / DX3",
                thickness="12-Way TPN",
                unit="SET",
                purchase_cost=4200.0,
                client_rate=6500.0,
                default_wastage_percent=0.0
            ),

            # 8. Painting & Finishes
            Material(
                name="Asian Paints Apex Ultima Protek Exterior Weatherproof",
                category="Paint",
                brand="Asian Paints",
                material_type="Nanotech Silicon",
                grade="Apex Ultima Protek",
                thickness="10 Year Warranty",
                unit="SQFT",
                purchase_cost=32.0,
                client_rate=55.0,
                default_wastage_percent=8.0
            ),
            Material(
                name="Sayerlack Italian PU Clear Wood Polish (Matt / Gloss)",
                category="Paint",
                brand="Sayerlack",
                material_type="Polyurethane Polish",
                grade="2-Pack Italian PU",
                thickness="3-Coat System",
                unit="SQFT",
                purchase_cost=65.0,
                client_rate=120.0,
                default_wastage_percent=5.0
            ),
        ]

        added_count = 0
        for mat in new_materials:
            if mat.name not in existing_names:
                db.add(mat)
                added_count += 1

        db.commit()
        print(f"Successfully added {added_count} construction & civil materials.")

        # Check if Turnkey Villa Construction project exists
        villa_proj = db.query(Project).filter(Project.name.like("%Villa Construction%")).first()
        if not villa_proj:
            # Create a Client for Turnkey Construction
            client_vikram = db.query(Client).filter(Client.phone == "9820123456").first()
            if not client_vikram:
                client_vikram = Client(
                    name="Vikramaditya Singhania",
                    phone="9820123456",
                    whatsapp="9820123456",
                    email="vikram.singhania@gmail.com",
                    address="Plot 44, Beverly Hills Estates, Alibaug / Khandala",
                    city="Mumbai"
                )
                db.add(client_vikram)
                db.commit()
                db.refresh(client_vikram)

            villa_proj = Project(
                client_id=client_vikram.id,
                name="Turnkey G+1 Luxury Villa Construction & Interior",
                property_type="Villa",
                location="Plot 44, Beverly Hills Estates, Khandala",
                carpet_area=3450.0,
                number_of_rooms=6,
                start_date="2026-10-20",
                expected_completion="2027-08-30",
                status="Quotation Sent",
                estimated_budget=7800000.0
            )
            db.add(villa_proj)
            db.commit()
            db.refresh(villa_proj)

            # Create construction & interior rooms/phases
            room_civil = Room(project_id=villa_proj.id, name="Substructure & Civil RCC", floor="Ground Level", description="Excavation, Foundation, Columns, Beams & M25 Slabs")
            room_masonry = Room(project_id=villa_proj.id, name="Masonry & Plastering", floor="G+1 Structure", description="AAC blockwork, external waterproof plaster & internal gypsum plaster")
            room_mep = Room(project_id=villa_proj.id, name="Plumbing & Electrical MEP", floor="Whole Villa", description="Concealed Astral CPVC/PVC lines, Polycab FRLS wiring, DB panels")
            room_flooring = Room(project_id=villa_proj.id, name="Flooring & Italian Marble", floor="Ground & First Floor", description="Italian Statuario marble living room & Kajaria GVT bedrooms")
            room_kitchen = Room(project_id=villa_proj.id, name="Modular Kitchen & Utility", floor="Ground Floor", description="Century BWP 710 + Acrylic Finish + Hafele German fittings")
            room_master = Room(project_id=villa_proj.id, name="Master Suite & Wardrobes", floor="First Floor", description="Action TESA HDHMR floor-to-ceiling wardrobe + Fluted veneer wall")

            db.add_all([room_civil, room_masonry, room_mep, room_flooring, room_kitchen, room_master])
            db.commit()
            for r in [room_civil, room_masonry, room_mep, room_flooring, room_kitchen, room_master]:
                db.refresh(r)

            # Helper to fetch material
            def get_m(name_prefix):
                return db.query(Material).filter(Material.name.like(f"{name_prefix}%")).first()

            mat_rmc = get_m("Ready Mix Concrete")
            mat_tmt = get_m("Tata Tiscon")
            mat_aac = get_m("Siporex")
            mat_gypsum = get_m("Saint-Gobain Gyproc Elite")
            mat_ext_plaster = get_m("External Sand Face")
            mat_wp = get_m("Dr. Fixit Pidifin")
            mat_marble = get_m("Imported Italian Marble")
            mat_tiles = get_m("Kajaria 1200x600")
            mat_cpvc = get_m("Astral CPVC")
            mat_elec = get_m("Polycab FRLS")
            mat_ply = get_m("18mm BWP Plywood 710")
            mat_acrylic = get_m("2mm High Gloss Acrylic")
            mat_hdhmr = get_m("18mm HDHMR")

            boq_items = [
                # 1. Civil RCC
                BOQItem(
                    room_id=room_civil.id,
                    material_id=mat_rmc.id if mat_rmc else None,
                    item_title="RCC M25 Structural Concrete (Footings, Columns, Plinth & Slabs)",
                    category="Civil & Structural",
                    calculation_type="CFT",
                    height=10.0, width=50.0, length=40.0, multiplier=1.0,
                    net_quantity=4200.0, unit="CFT", wastage_percent=3.0,
                    chargeable_quantity=4326.0, purchase_rate=165.0, client_rate=210.0,
                    total_cost=713790.0, total_amount=908460.0, gross_margin=194670.0
                ),
                BOQItem(
                    room_id=room_civil.id,
                    material_id=mat_tmt.id if mat_tmt else None,
                    item_title="Tata Tiscon Fe550D TMT Rebar (Cutting, Bending & Binding)",
                    category="Civil & Structural",
                    calculation_type="KG",
                    height=0, width=0, length=0, multiplier=12500.0,
                    net_quantity=12500.0, unit="KG", wastage_percent=4.0,
                    chargeable_quantity=13000.0, purchase_rate=68.0, client_rate=82.0,
                    total_cost=884000.0, total_amount=1066000.0, gross_margin=182000.0
                ),

                # 2. Masonry & Plaster
                BOQItem(
                    room_id=room_masonry.id,
                    material_id=mat_aac.id if mat_aac else None,
                    item_title="Siporex 150mm AAC Blockwork Masonry with Polymer Mortar",
                    category="Masonry & Bricks",
                    calculation_type="AREA",
                    height=10.0, width=480.0, length=0, multiplier=1.0,
                    net_quantity=4800.0, unit="SQFT", wastage_percent=3.0,
                    chargeable_quantity=4944.0, purchase_rate=62.0, client_rate=88.0,
                    total_cost=306528.0, total_amount=435072.0, gross_margin=128544.0
                ),
                BOQItem(
                    room_id=room_masonry.id,
                    material_id=mat_gypsum.id if mat_gypsum else None,
                    item_title="Saint-Gobain Gyproc Elite OneCoat Internal Gypsum Plaster",
                    category="Plaster & Gypsum",
                    calculation_type="AREA",
                    height=10.0, width=420.0, length=0, multiplier=1.0,
                    net_quantity=4200.0, unit="SQFT", wastage_percent=5.0,
                    chargeable_quantity=4410.0, purchase_rate=28.0, client_rate=48.0,
                    total_cost=123480.0, total_amount=211680.0, gross_margin=88200.0
                ),
                BOQItem(
                    room_id=room_masonry.id,
                    material_id=mat_wp.id if mat_wp else None,
                    item_title="Dr. Fixit 2-Coat Polymer Waterproofing (Terrace & Sunk Slabs)",
                    category="Waterproofing",
                    calculation_type="AREA",
                    height=40.0, width=45.0, length=0, multiplier=1.0,
                    net_quantity=1800.0, unit="SQFT", wastage_percent=5.0,
                    chargeable_quantity=1890.0, purchase_rate=26.0, client_rate=46.0,
                    total_cost=49140.0, total_amount=86940.0, gross_margin=37800.0
                ),

                # 3. MEP (Plumbing & Electrical)
                BOQItem(
                    room_id=room_mep.id,
                    material_id=mat_cpvc.id if mat_cpvc else None,
                    item_title="Astral CPVC Concealed High-Pressure Plumbing Lines & Fixture Points",
                    category="Plumbing & Sanitary",
                    calculation_type="RUNNING_FT",
                    height=0, width=0, length=850.0, multiplier=1.0,
                    net_quantity=850.0, unit="RUNNING_FT", wastage_percent=5.0,
                    chargeable_quantity=892.5, purchase_rate=38.0, client_rate=65.0,
                    total_cost=33915.0, total_amount=58012.5, gross_margin=24097.5
                ),
                BOQItem(
                    room_id=room_mep.id,
                    material_id=mat_elec.id if mat_elec else None,
                    item_title="Polycab FRLS Concealed Electrical Circuit Wiring & Schneider Points",
                    category="Electrical",
                    calculation_type="RUNNING_FT",
                    height=0, width=0, length=2400.0, multiplier=1.0,
                    net_quantity=2400.0, unit="RUNNING_FT", wastage_percent=5.0,
                    chargeable_quantity=2520.0, purchase_rate=18.0, client_rate=32.0,
                    total_cost=45360.0, total_amount=80640.0, gross_margin=35280.0
                ),

                # 4. Flooring & Marble
                BOQItem(
                    room_id=room_flooring.id,
                    material_id=mat_marble.id if mat_marble else None,
                    item_title="Imported Italian Statuario Marble Flooring (7-Stage Mirror Polish)",
                    category="Flooring & Tiling",
                    calculation_type="AREA",
                    height=30.0, width=40.0, length=0, multiplier=1.0,
                    net_quantity=1200.0, unit="SQFT", wastage_percent=12.0,
                    chargeable_quantity=1344.0, purchase_rate=320.0, client_rate=550.0,
                    total_cost=430080.0, total_amount=739200.0, gross_margin=309120.0
                ),
                BOQItem(
                    room_id=room_flooring.id,
                    material_id=mat_tiles.id if mat_tiles else None,
                    item_title="Kajaria 1200x600mm GVT Tiles in Bedrooms & Family Lounge",
                    category="Flooring & Tiling",
                    calculation_type="AREA",
                    height=0, width=0, length=0, multiplier=1.0,
                    net_quantity=1600.0, unit="SQFT", wastage_percent=8.0,
                    chargeable_quantity=1728.0, purchase_rate=65.0, client_rate=110.0,
                    total_cost=112320.0, total_amount=190080.0, gross_margin=77760.0
                ),

                # 5. Modular Kitchen & Interior
                BOQItem(
                    room_id=room_kitchen.id,
                    material_id=mat_ply.id if mat_ply else None,
                    item_title="Complete Modular Kitchen (Century 18mm BWP 710 + Acrylic + Hafele)",
                    category="Cabinetry",
                    calculation_type="FIXED",
                    height=0, width=0, length=0, multiplier=1.0,
                    net_quantity=1.0, unit="LOT", wastage_percent=0.0,
                    chargeable_quantity=1.0, purchase_rate=295000.0, client_rate=450000.0,
                    total_cost=295000.0, total_amount=450000.0, gross_margin=155000.0
                ),

                # 6. Master Bedroom Wardrobe & Paneling
                BOQItem(
                    room_id=room_master.id,
                    material_id=mat_hdhmr.id if mat_hdhmr else None,
                    item_title="Full Height Master Wardrobe (Action TESA HDHMR + Merino Laminate + LED)",
                    category="Cabinetry",
                    calculation_type="AREA",
                    height=9.5, width=14.0, length=0, multiplier=1.0,
                    net_quantity=133.0, unit="SQFT", wastage_percent=10.0,
                    chargeable_quantity=146.3, purchase_rate=1100.0, client_rate=1950.0,
                    total_cost=160930.0, total_amount=285285.0, gross_margin=124355.0
                ),
            ]

            db.add_all(boq_items)
            db.commit()

            # Create Quotation for this Turnkey Construction Project
            subtotal = sum(b.total_amount for b in boq_items)
            total_cost = sum(b.total_cost for b in boq_items)
            discount = 111189.5  # round to clean figure
            subtotal_after_discount = subtotal - discount
            tax_amount = round(subtotal_after_discount * 0.18, 2)
            grand_total = subtotal_after_discount + tax_amount

            quote_villa = Quotation(
                tenant_id="tenant-abc-interiors",
                project_id=villa_proj.id,
                quotation_number="INT-2026-0051",
                version="R0",
                status="Quotation Sent",
                subtotal=subtotal,
                discount_amount=discount,
                tax_percent=18.0,
                tax_amount=tax_amount,
                total_amount=grand_total,
                total_cost=total_cost,
                gross_margin=subtotal_after_discount - total_cost,
                margin_percent=round(((subtotal_after_discount - total_cost) / subtotal_after_discount) * 100, 2),
                valid_until=(datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%d"),
                terms="30% Advance on signing, 25% on Plinth casting, 25% on Slab casting & Masonry, 15% on MEP & Interior installation, 5% on Handover."
            )
            db.add(quote_villa)
            db.commit()
            db.refresh(quote_villa)

            # Create Quotation Items
            room_map = {
                room_civil.id: "Substructure & Civil RCC",
                room_masonry.id: "Masonry & Plastering",
                room_mep.id: "Plumbing & Electrical MEP",
                room_flooring.id: "Flooring & Italian Marble",
                room_kitchen.id: "Modular Kitchen & Utility",
                room_master.id: "Master Suite & Wardrobes"
            }

            for b in boq_items:
                qi = QuotationItem(
                    quotation_id=quote_villa.id,
                    room_name=room_map.get(b.room_id, "General"),
                    item_title=b.item_title,
                    material_spec=f"{b.category} • Spec: {b.unit} • Wastage {b.wastage_percent}%",
                    quantity=b.chargeable_quantity,
                    unit=b.unit,
                    rate=b.client_rate,
                    amount=b.total_amount
                )
                db.add(qi)

            db.commit()
            print(f"Created Turnkey Construction Project: {villa_proj.name} with Quote #{quote_villa.quotation_number} (Total: ₹{grand_total:,.2f})")

    except Exception as e:
        db.rollback()
        print(f"Error during seed_construction: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_construction()
