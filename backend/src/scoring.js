import { relationshipEngine } from './relationshipEngine.js';

/**
 * HELPER: Clamp function
 */
const clamp = (val) => Math.max(0.0, Math.min(1.0, val));

/**
 * Calculate priority score for a single obligation
 * Using the updated safe scoring logic from scoring_alt.py
 */
export function computePriority(obligation, currentBalance, today = new Date()) {
    // 1. Calculate days left until due date
    const dueDate = new Date(obligation.due_date);
    const timeDiff = dueDate.getTime() - today.getTime();
    let daysToDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let urgency = (daysToDue <= 0) ? 1.0 : 1 / (daysToDue + 1);
    urgency = clamp(urgency);

    // 2. Penalty (0 to 1 scale)
    // Assuming penalty is given as a normalized factor (or small raw value)
    const rawPenalty = parseFloat(obligation.penalty || 0);
    const penaltyUsed = clamp(rawPenalty);

    // 3. Flexibility (Lower flexibility -> Higher priority)
    // flexibility_score on 1-10 scale? Normalize it.
    const rawFlex = parseFloat(obligation.flexibility_score || obligation.flexibility || 5);
    const normalizedFlex = clamp(rawFlex / 10.0);
    const flexibilityPriority = clamp(1 - normalizedFlex);

    // 4. Relationship Importance
    const importanceMap = {
        "high": 1.0,
        "medium": 0.5,
        "low": 0.2
    };
    const relInput = (obligation.relationship_importance || 'low').toLowerCase();
    const importanceUsed = clamp(importanceMap[relInput] || 0.2);

    // 🆕 RELATIONSHIP ENGINE INTEGRATION (Risk Multiplier)
    const riskMultiplier = relationshipEngine.getRiskMultiplier(obligation.name || obligation.vendor_name);

    // 5. Cash Impact
    let impact;
    const amount = parseFloat(obligation.amount) || 0;
    if (currentBalance <= 0) {
        impact = 1.0;
    } else {
        impact = amount / (currentBalance + amount);
    }
    impact = clamp(impact);

    // 6. Base Score Calculation
    const baseScore = (
        0.30 * urgency +
        0.25 * penaltyUsed +
        0.20 * flexibilityPriority +
        0.15 * importanceUsed +
        0.10 * impact
    );

    // 7. Adjusted Priority (Final Score)
    const finalScore = clamp(baseScore) * riskMultiplier;
    
    return parseFloat(finalScore.toFixed(4));
}

/**
 * Compute score for all obligations and attach it, sorting by highest priority
 */
export function scoreAllObligations(balance, obligations, today = new Date()) {
    const scoredObligations = obligations.map(o => {
        return {
            ...o,
            priority_score: computePriority(o, balance, today),
            relationship_status: relationshipEngine.getStatus(o.name || o.vendor_name)
        };
    });

    // Sort by highest score first
    return scoredObligations.sort((a, b) => b.priority_score - a.priority_score);
}
