from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import timedelta

# import engine modules
from engine.scoring import score_all_obligations
from engine.optimizer import optimize_plan
from engine.scenario import generate_scenarios
from engine.explain import explain_decision
from datetime import datetime

router = APIRouter()

# -------------------------------------------------
# INPUT SCHEMA (VERY IMPORTANT)
# -------------------------------------------------

class Obligation(BaseModel):
    name: str
    amount: float
    due_days: int
    penalty: float
    flexibility: float
    importance: float

class Receivable(BaseModel):
    name: str
    amount: float
    expected_days: int
    probability: float

class InputData(BaseModel):
    balance: float
    obligations: List[Obligation]
    receivables: List[Receivable]


# -------------------------------------------------
# API: ANALYZE
# -------------------------------------------------

@router.post("/analyze")
def analyze(data: InputData):

    today = datetime.today()

    # ---------------------------------------------
    # CONVERT INPUT → INTERNAL FORMAT
    # ---------------------------------------------
    financial_state = {
        "balance": data.balance,
        "today": today,
        "obligations": [],
        "receivables": []
    }

    # Convert obligations
    for o in data.obligations:
        financial_state["obligations"].append({
            "name": o.name,
            "amount": o.amount,
            "due_date": today.replace() + timedelta(days=o.due_days),
            "penalty": o.penalty,
            "flexibility": o.flexibility,
            "importance": o.importance
        })

    # Convert receivables
    for r in data.receivables:
        financial_state["receivables"].append({
            "name": r.name,
            "amount": r.amount,
            "expected_date": today.replace() + timedelta(days=r.expected_days),
            "probability": r.probability
        })

    # ---------------------------------------------
    # RUN ENGINE
    # ---------------------------------------------
    scored = score_all_obligations(financial_state)

    best_plan, results = optimize_plan(financial_state)

    scenarios = generate_scenarios(best_plan, results)

    explanations = explain_decision(scored)

    # ---------------------------------------------
    # RETURN RESPONSE
    # ---------------------------------------------
    return {
        "best_plan": best_plan,
        "all_plans": results,
        "scenarios": scenarios,
        "explanations": explanations
    }