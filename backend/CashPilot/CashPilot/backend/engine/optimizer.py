from engine.simulation import simulate_cashflow
from engine.cost import calculate_cost

# -------------------------------------------------
# FUNCTION: generate_plans
# PURPOSE:
# Create different payment strategies
# -------------------------------------------------

def generate_plans(financial_state):

    obligations = financial_state["obligations"]

    plans = []

    # ---------------------------------------------
    # PLAN 1: ORIGINAL (PAY ALL)
    # ---------------------------------------------
    plans.append(("Plan A - Pay All", obligations.copy()))

    # ---------------------------------------------
    # PLAN 2: DELAY LOWEST PRIORITY
    # ---------------------------------------------
    sorted_obs = sorted(obligations, key=lambda x: x["score"])

    plan_b = sorted_obs[1:]  # remove lowest priority
    plans.append(("Plan B - Delay Lowest", plan_b))

    # ---------------------------------------------
    # PLAN 3: DELAY TWO LOWEST
    # ---------------------------------------------
    plan_c = sorted_obs[2:]
    plans.append(("Plan C - Delay Two", plan_c))

    return plans


# -------------------------------------------------
# FUNCTION: optimize_plan
# PURPOSE:
# Choose best plan based on cost
# -------------------------------------------------

def optimize_plan(financial_state):

    plans = generate_plans(financial_state)

    best_plan = None
    best_cost = float("inf")

    results = []

    for name, plan_obligations in plans:

        # create new state for simulation
        test_state = financial_state.copy()
        test_state["obligations"] = plan_obligations

        # simulate this plan
        simulation = simulate_cashflow(test_state)

        # calculate cost
        cost = calculate_cost(simulation, plan_obligations)

        results.append((name, cost["total_cost"]))

        # update best plan
        if cost["total_cost"] < best_cost:
            best_cost = cost["total_cost"]
            best_plan = name

    return best_plan, results