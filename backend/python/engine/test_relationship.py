import sys
import os

# Fix import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.relationship_engine import RelationshipEngine


def main():
    engine = RelationshipEngine()

    vendor = "ABC Suppliers"

    # Simulate transactions
    engine.update_relationship(vendor, amount=10000, paid_on_time=True)
    engine.update_relationship(vendor, amount=15000, delayed=True)
    engine.update_relationship(vendor, amount=20000, delayed=True)

    print("\n📊 RELATIONSHIP STATUS:\n")

    print("Vendor:", vendor)
    print("Score:", engine.get_or_create_vendor(vendor).score)
    print("Status:", engine.get_status(vendor))
    print("Risk Multiplier:", engine.get_risk_multiplier(vendor))
    print("Email Tone:", engine.get_email_tone(vendor))


if __name__ == "__main__":
    main()
