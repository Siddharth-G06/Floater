from datetime import datetime

# -------------------------------------------------
# FUNCTION: compute_priority
# PURPOSE:
# Calculate priority score for a single obligation
# -------------------------------------------------

def compute_priority(obligation, current_balance, today):
    
    # ---------------------------------------------
    # STEP 1: CALCULATE DAYS LEFT UNTIL DUE DATE
    # ---------------------------------------------
    # (due_date - today) gives time difference
    # .days converts it into number of days
    days_to_due = (obligation["due_date"] - today).days

    # ---------------------------------------------
    # STEP 2: CALCULATE URGENCY
    # ---------------------------------------------
    # Formula:
    # urgency = 1 / (days_to_due + 1)
    # 
    # Why +1?
    # → avoid division by zero when due today
    # 
    # Meaning:
    # - closer due date → higher urgency
    # - far due date → lower urgency
    urgency = 1 / (days_to_due + 1)

    # ---------------------------------------------
    # STEP 3: PENALTY
    # ---------------------------------------------
    # Already provided (0 to 1 scale)
    # Higher value → more dangerous to delay
    penalty = obligation["penalty"]

    # ---------------------------------------------
    # STEP 4: FLEXIBILITY
    # ---------------------------------------------
    # Higher flexibility → easier to delay
    # But we want opposite effect:
    # So we use (1 - flexibility)
    flexibility = 1 - obligation["flexibility"]

    # ---------------------------------------------
    # STEP 5: IMPORTANCE
    # ---------------------------------------------
    # Represents relationship importance
    # Example:
    # Salary → 1.0 (highest)
    # Vendor → 0.5
    importance = obligation["importance"]

    # ---------------------------------------------
    # STEP 6: CASH IMPACT
    # ---------------------------------------------
    # How big is this payment relative to balance?
    # Example:
    # 20k / 30k = 0.66 → high impact
    impact = obligation["amount"] / current_balance

    # ---------------------------------------------
    # STEP 7: WEIGHTED SCORE
    # ---------------------------------------------
    # Combine all features into one score
    # These weights are tuned for balance
    score = (
        0.30 * urgency +        # urgency is most important
        0.25 * penalty +        # penalty is second
        0.20 * flexibility +    # low flexibility → higher score
        0.15 * importance +     # relationship importance
        0.10 * impact           # financial impact
    )

    # ---------------------------------------------
    # STEP 8: RETURN SCORE
    # ---------------------------------------------
    return score


# -------------------------------------------------
# FUNCTION: score_all_obligations
# PURPOSE:
# Compute score for all obligations and attach it
# -------------------------------------------------

def score_all_obligations(financial_state):

    # Extract values from state
    balance = financial_state["balance"]
    obligations = financial_state["obligations"]
    today = financial_state["today"]

    # Loop through each obligation
    for o in obligations:
        
        # Compute score using function above
        o["score"] = compute_priority(o, balance, today)

    # ---------------------------------------------
    # STEP 9: SORT OBLIGATIONS BY SCORE
    # ---------------------------------------------
    # Highest score → highest priority
    obligations.sort(key=lambda x: x["score"], reverse=True)

    return obligations