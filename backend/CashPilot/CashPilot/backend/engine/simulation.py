# You will:

# ✔ Track balance day-by-day
# ✔ Add receivables
# ✔ Subtract obligations
# ✔ Detect failures

from datetime import timedelta

# -------------------------------------------------
# FUNCTION: simulate_cashflow
# PURPOSE:
# Simulate day-by-day cash balance
# -------------------------------------------------

def simulate_cashflow(financial_state, days=10):

    # ---------------------------------------------
    # STEP 1: EXTRACT DATA FROM STATE
    # ---------------------------------------------
    balance = financial_state["balance"]
    obligations = financial_state["obligations"]
    receivables = financial_state["receivables"]
    today = financial_state["today"]

    # ---------------------------------------------
    # STEP 2: CREATE RESULT STORAGE
    # ---------------------------------------------
    # timeline will store:
    # (day, balance, event)
    timeline = []

    # track if balance goes negative
    negative_days = []

    # ---------------------------------------------
    # STEP 3: LOOP DAY-BY-DAY
    # ---------------------------------------------
    for d in range(days):

        # current simulated date
        current_day = today + timedelta(days=d)

        # -----------------------------------------
        # STEP 4: ADD RECEIVABLES (INCOMING MONEY)
        # -----------------------------------------
        for r in receivables:

            # if receivable arrives today
            if r["expected_date"].date() == current_day.date():

                # probability-based income
                incoming = r["amount"] * r["probability"]

                balance += incoming

                timeline.append((
                    current_day.date(),
                    f"+₹{incoming} from {r['name']}",
                    balance
                ))

        # -----------------------------------------
        # STEP 5: PAY OBLIGATIONS (OUTGOING MONEY)
        # -----------------------------------------
        for o in obligations:

            # if obligation is due today
            if o["due_date"].date() == current_day.date():

                # check if enough balance
                if balance >= o["amount"]:
                    balance -= o["amount"]

                    timeline.append((
                        current_day.date(),
                        f"-₹{o['amount']} paid to {o['name']}",
                        balance
                    ))

                else:
                    # NOT enough money → conflict
                    timeline.append((
                        current_day.date(),
                        f"❌ FAILED payment: {o['name']}",
                        balance
                    ))

        # -----------------------------------------
        # STEP 6: CHECK NEGATIVE BALANCE
        # -----------------------------------------
        if balance < 0:
            negative_days.append(current_day.date())

        # -----------------------------------------
        # STEP 7: STORE DAILY BALANCE
        # -----------------------------------------
        timeline.append((
            current_day.date(),
            "Daily Balance",
            balance
        ))

    # ---------------------------------------------
    # STEP 8: RETURN RESULTS
    # ---------------------------------------------
    return {
        "timeline": timeline,
        "negative_days": negative_days
    }