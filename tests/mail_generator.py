import subprocess


def generate_email(
    vendor_name: str,
    amount: float,
    due_date: str,
    mode: str = "caution",  # stable | caution | emergency
    strategy: str = None
):
    """
    Generate a professional business email using Ollama (LLaMA 3)
    """

    prompt = f"""
You are a professional financial assistant helping a small business manage cash flow.

Write a concise, polite, and professional email.

Context:
- Vendor: {vendor_name}
- Amount Due: ₹{amount}
- Due Date: {due_date}
- Situation: {mode.upper()} mode
- Strategy: {strategy if strategy else "Not specified"}

Instructions:
- Keep it under 150 words
- Maintain a respectful tone
- Be clear and confident (not desperate)
- Include a subject line
- Provide only the final email (no explanations)

Mode behavior:
- STABLE → confirm payment
- CAUTION → request slight flexibility
- EMERGENCY → request delay or partial payment
"""

    try:
        result = subprocess.run(
            ["ollama", "run", "llama3", prompt],
            capture_output=True,
            text=True
        )

        output = result.stdout.strip()

        if not output:
            raise Exception("Empty response from model")

        return output

    except Exception as e:
        return f"❌ Error generating email: {str(e)}"