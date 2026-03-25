import { relationshipEngine } from './relationshipEngine.js';

/**
 * Calculate priority score for a single obligation
 * Translated from the CashPilot Python Engine (scoring.py)
 */
export function computePriority(obligation, currentBalance, today = new Date()) {
    // 1. Calculate days left until due date
    const dueDate = new Date(obligation.due_date);
    const timeDiff = dueDate.getTime() - today.getTime();
    let daysToDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
    daysToDue = Math.max(0, daysToDue); // Cap at 0 if overdue
    
    // 2. Calculate Urgency (avoid division by zero)
    const urgency = 1 / (daysToDue + 1);

    // 3. Penalty Normalization (0 to 1 scale)
    const rawPenalty = parseFloat(obligation.penalty) || 0;
    const penaltyNormalized = Math.min(1.0, rawPenalty / 1000.0);

    // 4. Flexibility 
    const flexibility = 1 - parseFloat(obligation.flexibility_score || 0.5);

    // 5. Importance (Relationship Weight)
    let importance = 0.5;
    const relImp = obligation.relationship_importance;
    if (relImp === 'high') importance = 1.0;
    else if (relImp === 'low') importance = 0.1;

    // 🆕 RELATIONSHIP ENGINE INTEGRATION
    // Get the risk multiplier based on history (sensitive → 1.5 multiplier)
    const riskMultiplier = relationshipEngine.getRiskMultiplier(obligation.name || obligation.vendor_name);

    // 6. Cash Impact
    const amount = parseFloat(obligation.amount) || 0;
    const impact = amount / Math.max(1, currentBalance);

    // 7. Weighted Base Score
    const baseScore = (
        0.30 * urgency +        // urgency is most important
        0.25 * penaltyNormalized + // penalty is second
        0.20 * flexibility +    // low flexibility -> higher score
        0.15 * importance +     // relationship importance
        0.10 * impact           // financial impact
    );

    // 8. Adjusted Priority (Final Score)
    return baseScore * riskMultiplier;
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
