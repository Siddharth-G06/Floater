# -------------------------------------------------
# FUNCTION: explain_decision
# PURPOSE:
# Generate explanation for each obligation
# -------------------------------------------------

def explain_decision(obligations):

    explanations = []

    for o in obligations:

        # -----------------------------------------
        # BUILD EXPLANATION TEXT
        # -----------------------------------------
        reason = f"""
{o['name']}:

- Urgency: {round(o['score'], 2)} (higher means more urgent)
- Penalty: {o['penalty']} (higher penalty → pay first)
- Flexibility: {o['flexibility']} (lower flexibility → harder to delay)
- Importance: {o['importance']} (relationship impact)

Decision:
This obligation is prioritized based on its high combined score.
"""

        explanations.append(reason)

    return explanations