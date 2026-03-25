from datetime import datetime, timedelta

# -----------------------------
# CURRENT DATE
# -----------------------------
today = datetime.today()

# -----------------------------
# CURRENT BALANCE
# -----------------------------
current_balance = 30000


# -----------------------------
# OBLIGATIONS (PAYABLES)
# -----------------------------
obligations = [
    {
        "id": 1,
        "name": "Office Rent",
        "amount": 20000,
        "due_date": today + timedelta(days=1),
        "penalty": 0.9,
        "flexibility": 0.2,
        "importance": 1.0   # critical
    },
    {
        "id": 2,
        "name": "Vendor Payment - ABC Supplies",
        "amount": 15000,
        "due_date": today + timedelta(days=3),
        "penalty": 0.5,
        "flexibility": 0.7,
        "importance": 0.5
    },
    {
        "id": 3,
        "name": "Employee Salaries",
        "amount": 25000,
        "due_date": today + timedelta(days=5),
        "penalty": 1.0,
        "flexibility": 0.1,
        "importance": 1.0
    },
    {
        "id": 4,
        "name": "Utility Bill",
        "amount": 8000,
        "due_date": today + timedelta(days=4),
        "penalty": 0.4,
        "flexibility": 0.6,
        "importance": 0.6
    }
]


# -----------------------------
# RECEIVABLES (INCOMING MONEY)
# -----------------------------
receivables = [
    {
        "id": 1,
        "name": "Client Payment - XYZ Ltd",
        "amount": 20000,
        "expected_date": today + timedelta(days=2),
        "probability": 0.8
    },
    {
        "id": 2,
        "name": "Client Payment - DEF Corp",
        "amount": 10000,
        "expected_date": today + timedelta(days=6),
        "probability": 0.6
    }
]


# -----------------------------
# FINAL STATE OBJECT
# -----------------------------
financial_state = {
    "balance": current_balance,
    "obligations": obligations,
    "receivables": receivables,
    "today": today
}