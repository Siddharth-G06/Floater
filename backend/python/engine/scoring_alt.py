from datetime import datetime

# -------------------------------------------------
# HELPER: CLAMP FUNCTION
# Ensures values stay between 0 and 1
# -------------------------------------------------
def clamp(x):
    return max(0.0, min(1.0, x))


# -------------------------------------------------
# FUNCTION: compute_priority
# PURPOSE:
# Calculate priority score for a single obligation
# -------------------------------------------------
def compute_priority(obligation, current_balance, today):

    # ---------------------------------------------
    # STEP 1: DAYS TO DUE
    # ---------------------------------------------
    days_to_due = (obligation["due_date"] - today).days

    if days_to_due < 0:
        urgency = 1.0   # overdue → highest urgency
    else:
        urgency = 1 / (days_to_due + 1)

    urgency = clamp(urgency)

    # ---------------------------------------------
    # STEP 2: PENALTY
    # ---------------------------------------------
    # Expected penalty is raw number, clamp ensures it stays 0 to 1
    # Note: If penalty was on 0-1000 scale, normalize it before clamp
    penalty = clamp(obligation.get("penalty", 0))

    # ---------------------------------------------
    # STEP 3: FLEXIBILITY
    # ---------------------------------------------
    raw_flex = clamp(obligation.get("flexibility_score", obligation.get("flexibility", 0.5)))
    flexibility = 1 - raw_flex   # invert (low flexibility → high priority)
    flexibility = clamp(flexibility)

    # ---------------------------------------------
    # STEP 4: RELATIONSHIP IMPORTANCE
    # ---------------------------------------------
    importance_map = {
        "high": 1.0,
        "medium": 0.5,
        "low": 0.2
    }

    rel_input = obligation.get("relationship_importance", "low")
    rel_score = importance_map.get(str(rel_input).lower(), 0.2)
    rel_score = clamp(rel_score)

    # ---------------------------------------------
    # STEP 5: CASH IMPACT
    # ---------------------------------------------
    # safer normalization
    if current_balance <= 0:
        impact = 1.0
    else:
        impact = obligation["amount"] / (current_balance + obligation["amount"])

    impact = clamp(impact)

    # ---------------------------------------------
    # STEP 6: FINAL SCORE
    # ---------------------------------------------
    score = (
        0.30 * urgency +
        0.25 * penalty +
        0.20 * flexibility +
        0.15 * rel_score +
        0.10 * impact
    )

    # Ensure no negative score
    score = max(0.0, score)

    return round(score, 4)


# -------------------------------------------------
# FUNCTION: score_all_obligations
# PURPOSE:
# Compute score for all obligations and sort
# -------------------------------------------------
def score_all_obligations(financial_state):

    balance = financial_state["balance"]
    obligations = financial_state["obligations"]
    today = financial_state["today"]

    for o in obligations:

        # Ensure required keys exist
        if "due_date" not in o:
            raise ValueError(f"Missing due_date in obligation: {o}")

        if "amount" not in o:
            raise ValueError(f"Missing amount in obligation: {o}")

        o["score"] = compute_priority(o, balance, today)

    # Sort: highest score first
    obligations.sort(key=lambda x: x["score"], reverse=True)

    return obligations