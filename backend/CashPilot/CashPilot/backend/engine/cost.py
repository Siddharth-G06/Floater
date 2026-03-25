# -------------------------------------------------
# FUNCTION: calculate_cost
# PURPOSE:
# Evaluate how "bad" a plan is
# -------------------------------------------------

def calculate_cost(simulation_result, obligations):

    # ---------------------------------------------
    # STEP 1: INITIALIZE COST COMPONENTS
    # ---------------------------------------------
    penalty_cost = 0
    relationship_damage = 0
    risk_cost = 0

    timeline = simulation_result["timeline"]
    negative_days = simulation_result["negative_days"]

    # ---------------------------------------------
    # STEP 2: PENALTY + RELATIONSHIP DAMAGE
    # ---------------------------------------------
    for entry in timeline:

        # entry format:
        # (date, message, balance)
        message = entry[1]

        # if payment failed → penalty + damage
        if "FAILED" in message:

            # find which obligation failed
            for o in obligations:
                if o["name"] in message:

                    # penalty increases cost
                    penalty_cost += o["penalty"] * 1000

                    # relationship damage increases cost
                    relationship_damage += o["importance"] * 1000

    # ---------------------------------------------
    # STEP 3: RISK COST (NEGATIVE BALANCE)
    # ---------------------------------------------
    # each negative day adds risk
    risk_cost = len(negative_days) * 2000

    # ---------------------------------------------
    # STEP 4: TOTAL COST
    # ---------------------------------------------
    total_cost = penalty_cost + relationship_damage + risk_cost

    return {
        "total_cost": total_cost,
        "penalty_cost": penalty_cost,
        "relationship_damage": relationship_damage,
        "risk_cost": risk_cost
    }