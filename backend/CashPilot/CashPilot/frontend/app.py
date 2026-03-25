import streamlit as st
import requests

# ---------------------------------------------
# PAGE CONFIG
# ---------------------------------------------
st.set_page_config(page_title="CashPilot", layout="wide")

st.title("CashPilot - AI CFO Dashboard")

# ---------------------------------------------
# INPUT SECTION
# ---------------------------------------------
st.header("Enter Financial Data")

balance = st.number_input("Current Balance", value=30000)

st.subheader("Obligations")

obligations = []

num_ob = st.number_input("Number of Obligations", min_value=1, max_value=5, value=2)

for i in range(num_ob):
    st.write(f"Obligation {i+1}")
    name = st.text_input(f"Name {i}", f"Obligation {i+1}")
    amount = st.number_input(f"Amount {i}", value=10000)
    due_days = st.number_input(f"Due in Days {i}", value=2)
    penalty = st.slider(f"Penalty {i}", 0.0, 1.0, 0.5)
    flexibility = st.slider(f"Flexibility {i}", 0.0, 1.0, 0.5)
    importance = st.slider(f"Importance {i}", 0.0, 1.0, 0.5)

    obligations.append({
        "name": name,
        "amount": amount,
        "due_days": due_days,
        "penalty": penalty,
        "flexibility": flexibility,
        "importance": importance
    })

# ---------------------------------------------
# RECEIVABLES
# ---------------------------------------------
st.subheader("Receivables")

receivables = []

num_rec = st.number_input("Number of Receivables", min_value=0, max_value=5, value=1)

for i in range(num_rec):
    st.write(f"Receivable {i+1}")
    name = st.text_input(f"R Name {i}", f"Client {i+1}")
    amount = st.number_input(f"R Amount {i}", value=10000)
    expected_days = st.number_input(f"Expected in Days {i}", value=3)
    probability = st.slider(f"Probability {i}", 0.0, 1.0, 0.8)

    receivables.append({
        "name": name,
        "amount": amount,
        "expected_days": expected_days,
        "probability": probability
    })

# ---------------------------------------------
# ANALYZE BUTTON
# ---------------------------------------------
if st.button("Analyze"):

    # prepare request
    payload = {
        "balance": balance,
        "obligations": obligations,
        "receivables": receivables
    }

    # call backend API
    response = requests.post("http://127.0.0.1:8000/analyze", json=payload)

    if response.status_code == 200:
        data = response.json()

        st.success("Analysis Complete!")

        # -----------------------------------------
        # BEST PLAN
        # -----------------------------------------
        st.header("Best Plan")
        st.write(data["best_plan"])

        # -----------------------------------------
        # SCENARIOS
        # -----------------------------------------
        st.header("Scenarios")

        for key, value in data["scenarios"].items():
            st.write(f"**{key}** → {value}")

        # -----------------------------------------
        # EXPLANATIONS
        # -----------------------------------------
        st.header("Explanations")

        for e in data["explanations"]:
            st.text(e)

    else:
        st.error("API Error")