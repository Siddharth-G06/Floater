from typing import Dict, List
from dataclasses import dataclass, asdict

@dataclass
class VendorRelationship:
    """
    Data model for vendor relationship state.
    """
    vendor_name: str
    score: float = 70.0
    total_transactions: int = 0
    delayed_payments: int = 0
    on_time_payments: int = 0
    total_outstanding: float = 0.0

class RelationshipEngine:
    """
    Core engine for tracking and scoring vendor relationships.
    """

    def __init__(self):
        self.vendors: Dict[str, VendorRelationship] = {}

    def get_or_create_vendor(self, vendor_name: str) -> VendorRelationship:
        """Retrieves or initializes vendor standing."""
        if vendor_name not in self.vendors:
            self.vendors[vendor_name] = VendorRelationship(vendor_name=vendor_name)
        return self.vendors[vendor_name]

    def update_relationship(self, vendor_name: str, amount: float, paid_on_time: bool, delayed: bool = False):
        """Processes transaction to update score."""
        vendor = self.get_or_create_vendor(vendor_name)
        vendor.total_transactions += 1
        vendor.total_outstanding += amount
        
        if paid_on_time:
            vendor.on_time_payments += 1
            vendor.score += 5.0
        
        if delayed:
            vendor.delayed_payments += 1
            vendor.score -= 7.0
            if vendor.delayed_payments > 2:
                vendor.score -= 5.0

        if vendor.total_transactions > 10:
            vendor.score += 5.0

        vendor.score = max(0.0, min(100.0, vendor.score))

    def get_status(self, vendor_name: str) -> str:
        """Determines health status."""
        vendor = self.get_or_create_vendor(vendor_name)
        if vendor.score >= 80:
            return "strong"
        elif vendor.score >= 50:
            return "neutral"
        return "sensitive"

    def get_risk_multiplier(self, vendor_name: str) -> float:
        """Influences decision priority."""
        status = self.get_status(vendor_name)
        return 0.8 if status == "strong" else 1.0 if status == "neutral" else 1.5

    def get_email_tone(self, vendor_name: str) -> str:
        """Suggests communication tone."""
        status = self.get_status(vendor_name)
        return "friendly" if status == "strong" else "professional" if status == "neutral" else "formal"

    def export_all_states(self) -> List[Dict]:
        """Exports full engine state."""
        return [asdict(v) for v in self.vendors.values()]
