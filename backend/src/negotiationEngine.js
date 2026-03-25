/**
 * Negotiation Engine (JS Port)
 */

export class NegotiationPlan {
    constructor(vendor_name, action, tone, strategy, urgency, proposed_amount, delay_days, reason, intensity_score) {
        this.vendor_name = vendor_name;
        this.action = action;
        this.tone = tone;
        this.strategy = strategy;
        this.urgency = urgency;
        this.proposed_amount = proposed_amount;
        this.delay_days = delay_days;
        this.reason = reason;
        this.intensity_score = intensity_score;
    }
}

export class NegotiationEngine {
    constructor(relationshipEngine) {
        this.relationshipEngine = relationshipEngine;
    }

    generatePlan(transaction, decision) {
        const vendorName = transaction.vendor_name || transaction.name;
        const action = decision.action || 'pay_now';
        const delayDays = decision.delay_days || 0;
        const proposedAmount = decision.recommended_amount || transaction.amount;

        // 1. Fetch relationship context
        const status = this.relationshipEngine.getStatus(vendorName);
        const tone = this.relationshipEngine.getEmailTone(vendorName);

        // 2. Determine Urgency Level
        let urgency = "low";
        if (action === "pay_now") {
            urgency = "low";
        } else if (delayDays <= 3) {
            urgency = "medium";
        } else {
            urgency = "high";
        }

        // 3. Increase urgency for sensitive vendors
        if (status === "sensitive") {
            if (urgency === "low") urgency = "medium";
            else if (urgency === "medium") urgency = "high";
            else urgency = "critical";
        }

        // 4. Determine Strategy
        let strategy = "";
        let reason = "";
        let intensityScore = 0.0;

        if (action === "pay_now") {
            strategy = "Confirm payment on time";
            reason = `Maintains existing standing with ${vendorName}`;
            intensityScore = 0.1;
        } else if (action === "delay") {
            if (status === "strong") {
                strategy = "Request flexible extension";
                reason = "Leveraging strong relationship for liquidity";
                intensityScore = 0.4;
            } else if (status === "neutral") {
                strategy = "Request short extension with justification";
                reason = "Routine extension request";
                intensityScore = 0.6;
            } else { // sensitive
                strategy = "Carefully request minimal extension with assurance";
                reason = "Friction point detected - proceed with caution";
                intensityScore = 0.9;
            }
        } else if (action === "partial_pay") {
            strategy = "Propose partial payment now and settle remaining later";
            reason = "Proof of intent provided via immediate partial settlement";
            intensityScore = 0.7;
        }

        return new NegotiationPlan(
            vendorName,
            action,
            tone,
            strategy,
            urgency,
            proposedAmount,
            delayDays,
            reason,
            intensityScore
        );
    }

    prepareEmailInput(plan) {
        const modeMap = {
            "low": "standard",
            "medium": "advisory",
            "high": "defensive",
            "critical": "emergency"
        };

        return {
            vendor_name: plan.vendor_name,
            amount: plan.proposed_amount,
            due_date: "Scheduled", 
            mode: modeMap[plan.urgency] || "standard",
            tone: plan.tone,
            strategy: plan.strategy,
            reasoning: plan.reason
        };
    }
}
