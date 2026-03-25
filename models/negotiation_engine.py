from typing import Dict, Optional, Any
from dataclasses import dataclass, asdict

@dataclass
class NegotiationPlan:
    """
    Structured plan for a vendor negotiation.
    """
    vendor_name: str
    action: str
    tone: str
    strategy: str
    urgency: str
    proposed_amount: Optional[float] = None
    delay_days: Optional[int] = None
    reason: Optional[str] = None
    intensity_score: float = 0.0

class NegotiationEngine:
    """
    Combines financial decisions and relationship context into adaptive negotiation strategies.
    """

    def __init__(self, relationship_engine):
        """
        Initializes engine with a relationship tracker instance.
        """
        self.relationship_engine = relationship_engine

    def generate_plan(self, transaction: Dict[str, Any], decision: Dict[str, Any]) -> NegotiationPlan:
        """
        Generates a tailored negotiation plan based on financial and relationship factors.
        
        Args:
            transaction: dict with 'vendor_name', 'amount', 'due_date'
            decision: dict with 'action', 'delay_days', 'recommended_amount'
        """
        vendor_name = transaction.get('vendor_name')
        action = decision.get('action', 'pay_now')
        delay_days = decision.get('delay_days', 0)
        proposed_amount = decision.get('recommended_amount', transaction.get('amount'))

        # 1. Fetch relationship context
        status = self.relationship_engine.get_status(vendor_name)
        tone = self.relationship_engine.get_email_tone(vendor_name)

        # 2. Determine Urgency Level
        if action == "pay_now":
            urgency = "low"
        elif delay_days <= 3:
            urgency = "medium"
        else:
            urgency = "high"

        # 3. Increase urgency for sensitive vendors
        if status == "sensitive":
            if urgency == "low":
                urgency = "medium"
            elif urgency == "medium":
                urgency = "high"
            else:
                urgency = "critical"

        # 4. Determine Strategy
        strategy = ""
        reason = ""

        if action == "pay_now":
            strategy = "Confirm payment on time"
            reason = f"Maintains existing standing with {vendor_name}"
            intensity_score = 0.1
        
        elif action == "delay":
            if status == "strong":
                strategy = "Request flexible extension"
                reason = "Leveraging strong relationship for liquidity"
                intensity_score = 0.4
            elif status == "neutral":
                strategy = "Request short extension with justification"
                reason = "Routine extension request"
                intensity_score = 0.6
            else: # sensitive
                strategy = "Carefully request minimal extension with assurance"
                reason = "Friction point detected - proceed with caution"
                intensity_score = 0.9
        
        elif action == "partial_pay":
            strategy = "Propose partial payment now and settle remaining later"
            reason = "Proof of intent provided via immediate partial settlement"
            intensity_score = 0.7

        # 5. Build and return plan
        return NegotiationPlan(
            vendor_name=vendor_name,
            action=action,
            tone=tone,
            strategy=strategy,
            urgency=urgency,
            proposed_amount=proposed_amount,
            delay_days=delay_days,
            reason=reason,
            intensity_score=intensity_score
        )

    def prepare_email_input(self, plan: NegotiationPlan) -> Dict[str, Any]:
        """
        Prepares structured data for the LLM email generator.
        """
        # Map urgency to mode for the LLM
        mode_map = {
            "low": "standard",
            "medium": "advisory",
            "high": "defensive",
            "critical": "emergency"
        }
        
        plan_dict = asdict(plan)
        
        return {
            "vendor_name": plan.vendor_name,
            "amount": plan.proposed_amount,
            "due_date": "Original Due Date", # Fallback if not in plan
            "mode": mode_map.get(plan.urgency, "standard"),
            "tone": plan.tone,
            "strategy": plan.strategy,
            "reasoning": plan.reason
        }
