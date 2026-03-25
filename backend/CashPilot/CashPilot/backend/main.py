# from data.dummy_data import financial_state

# print("Current Balance:", financial_state["balance"])

# print("\nObligations:")
# for o in financial_state["obligations"]:
#     print(o["name"], o["amount"], o["due_date"])

# print("\nReceivables:")
# for r in financial_state["receivables"]:
#     print(r["name"], r["amount"], r["expected_date"])

from data.dummy_data import financial_state
from engine.scoring import score_all_obligations
from engine.simulation import simulate_cashflow
from engine.optimizer import optimize_plan
from engine.scenario import generate_scenarios
from engine.explain import explain_decision

from fastapi import FastAPI
from api.routes import router

# Run scoring
scored = score_all_obligations(financial_state)

print("\n--- PRIORITY SCORES ---")

for o in scored:
    print(f"{o['name']} → Score: {round(o['score'], 3)}")

result = simulate_cashflow(financial_state, days=7)

print("\n--- CASH FLOW SIMULATION ---")

for entry in result["timeline"]:
    print(entry)

print("\nNegative Days:", result["negative_days"])


# Step 2: optimization
best_plan, results = optimize_plan(financial_state)

# Step 3: scenarios
scenarios = generate_scenarios(best_plan, results)

# Step 4: explanations
explanations = explain_decision(scored)


print("\n--- PLAN COMPARISON ---")
for r in results:
    print(r)

print("\nBEST PLAN:", best_plan)

print("\n--- SCENARIOS ---")
for k, v in scenarios.items():
    print(k, "→", v)

print("\n--- BEST PLAN ---")
print(best_plan)

print("\n--- EXPLANATIONS ---")
for e in explanations:
    print(e)


# create app
app = FastAPI()

# include routes
app.include_router(router)

# root endpoint
@app.get("/")
def home():
    return {"message": "CashPilot API running 🚀"}

