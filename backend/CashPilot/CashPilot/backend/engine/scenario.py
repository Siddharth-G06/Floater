# -------------------------------------------------
# FUNCTION: generate_scenarios
# PURPOSE:
# Create 3 types of plans for comparison
# -------------------------------------------------

def generate_scenarios(best_plan_name, all_results):

    scenarios = {}

    # ---------------------------------------------
    # SAFE SCENARIO
    # ---------------------------------------------
    # Usually highest cost but safest
    # (first plan in results assumed safe)
    scenarios["Safe"] = all_results[0]

    # ---------------------------------------------
    # BALANCED SCENARIO
    # ---------------------------------------------
    # Best plan chosen by optimizer
    for plan in all_results:
        if plan[0] == best_plan_name:
            scenarios["Balanced"] = plan

    # ---------------------------------------------
    # AGGRESSIVE SCENARIO
    # ---------------------------------------------
    # Usually lowest cost but higher risk
    scenarios["Aggressive"] = min(all_results, key=lambda x: x[1])

    return scenarios