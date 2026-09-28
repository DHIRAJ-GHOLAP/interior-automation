from typing import Tuple

class CalculationEngine:
    @staticmethod
    def calculate_dimensions(
        calculation_type: str, # AREA, RUNNING_FT, PIECES, FIXED
        height: float = 0.0,
        width: float = 0.0,
        length: float = 0.0,
        multiplier: float = 1.0,
        unit: str = "FT"
    ) -> float:
        """
        Calculates net quantity based on calculation_type and dimensions.
        Handles unit conversions if dimensions are entered in inches.
        """
        multiplier = max(multiplier, 1.0)
        
        # If entered in inches, convert to feet for standard interior measurements
        if unit.upper() == "INCH":
            h = height / 12.0
            w = width / 12.0
            l = length / 12.0
        elif unit.upper() == "METER":
            h = height * 3.28084
            w = width * 3.28084
            l = length * 3.28084
        else:
            h, w, l = height, width, length

        calc_type = calculation_type.upper()
        if calc_type in ("AREA", "SQFT"):
            # Standard Wall / Slab / Panel / Flooring / Plaster: Height x Width * multiplier
            net = (h * w) * multiplier
        elif calc_type in ("RUNNING_FT", "RFT"):
            # For plumbing pipes, electrical conduit, skirting, edge band, pelmet, LED strips
            net = (l if l > 0 else (h + w)) * multiplier
        elif calc_type in ("VOLUME", "CFT", "CUFT"):
            # 3D Volume for concrete, soil excavation, foundation, brickwork: Length x Width x Height in ft
            depth = l if l > 0 else 1.0
            net = (h * w * depth) * multiplier
        elif calc_type == "BRASS":
            # Indian civil unit: 1 Brass = 100 Cubic Feet (for sand, aggregate, excavation, metal)
            depth = l if l > 0 else 1.0
            cft = (h * w * depth) * multiplier
            net = cft / 100.0
        elif calc_type in ("PIECES", "UNIT", "BAG", "NOS", "SET", "KG", "TON"):
            # Discrete units, bags, or direct quantity multipliers
            net = multiplier
        elif calc_type in ("FIXED", "LOT"):
            net = multiplier
        else:
            net = (h * w) * multiplier if (h > 0 and w > 0) else multiplier

        return round(net, 2)

    @staticmethod
    def apply_wastage(net_quantity: float, wastage_percent: float) -> Tuple[float, float]:
        """
        Calculates:
        wastage_qty = net_quantity * (wastage_percent / 100)
        chargeable_qty = net_quantity + wastage_qty
        """
        wastage_qty = round(net_quantity * (wastage_percent / 100.0), 2)
        chargeable_qty = round(net_quantity + wastage_qty, 2)
        return wastage_qty, chargeable_qty

    @staticmethod
    def calculate_item_financials(
        chargeable_quantity: float,
        purchase_rate: float,
        client_rate: float
    ) -> Tuple[float, float, float, float]:
        """
        Returns:
        total_cost, total_amount, gross_margin, margin_percent
        """
        total_cost = round(chargeable_quantity * purchase_rate, 2)
        total_amount = round(chargeable_quantity * client_rate, 2)
        gross_margin = round(total_amount - total_cost, 2)
        margin_percent = round((gross_margin / total_amount * 100.0), 2) if total_amount > 0 else 0.0
        return total_cost, total_amount, gross_margin, margin_percent
