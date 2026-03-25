from typing import Dict, List
from dataclasses import dataclass, asdict

@dataclass
class VendorRelationship:
    """
    Data model for vendor relationship state.
    
    Attributes:
        vendor_name: Unique name of the vendor.
        score: trust score (0.0 to 100.0).
        total_transactions: count of processed payments/invoices.
        delayed_payments: count of payments made after due date.
        on_time_payments: count of payments made on or before due date.
        total_outstanding: total current debt to this vendor.
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
        # In-memory storage for vendor states
        self.vendors: Dict[str, VendorRelationship] = {}

    def get_or_create_vendor(self, vendor_name: str) -> VendorRelationship:
        """
        Retrieves an existing vendor or initializes a new one.
        """
        if vendor_name not in self.vendors:
            self.vendors[vendor_name] = VendorRelationship(vendor_name=vendor_name)
        return self.vendors[vendor_name]

    def update_relationship(self, vendor_name: str, amount: float, paid_on_time: bool, delayed: bool = False):
        """
        Updates vendor standing based on a newly processed transaction.
        
        Logic:
            - On-time payment -> increase score (+5)
            - Delayed payment -> decrease score (-7)
            - Frequent delays (>2) -> extra penalty (-5)
            - Long relationship (>10 transactions) -> bonus (+5)
            - Score is clamped between 0 and 100
        """
        vendor = self.get_or_create_vendor(vendor_name)

        # Update base metrics
        vendor.total_transactions += 1
        vendor.total_outstanding += amount
        
        if paid_on_time:
            vendor.on_time_payments += 1
            vendor.score += 5.0
        
        if delayed:
            vendor.delayed_payments += 1
            vendor.score -= 7.0
            
            # Extra penalty for frequent delays
            if vendor.delayed_payments > 2:
                vendor.score -= 5.0

        # Loyalty bonus for consistent relationship
        if vendor.total_transactions > 10:
            vendor.score += 5.0

        # Clamp results
        vendor.score = max(0.0, min(100.0, vendor.score))

    def get_status(self, vendor_name: str) -> str:
        """
        Classifies vendor relationship health.
        """
        vendor = self.get_or_create_vendor(vendor_name)
        if vendor.score >= 80:
            return "strong"
        elif vendor.score >= 50:
            return "neutral"
        return "sensitive"

    def get_risk_multiplier(self, vendor_name: str) -> float:
        """
        Returns a multiplier that influences a decision engine's assessment.
        Low score = high multiplier (risky to delay).
        """
        status = self.get_status(vendor_name)
        if status == "strong":
            return 0.8
        elif status == "neutral":
            return 1.0
        return 1.5

    def get_email_tone(self, vendor_name: str) -> str:
        """
        Suggests an appropriate tone for automated outbound negotiation.
        """
        status = self.get_status(vendor_name)
        if status == "strong":
            return "friendly"
        elif status == "neutral":
            return "professional"
        return "formal"

    def export_all_states(self) -> List[Dict]:
        """
        Returns all vendor data as a list of dictionaries for export or persistence.
        """
        return [asdict(v) for v in self.vendors.values()]