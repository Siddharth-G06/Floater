import sys
import json
import subprocess
from typing import Dict

def generate_email(data: Dict):
    vendor_name = data.get('vendor_name', 'Vendor')
    amount = data.get('amount', 0.0)
    due_date = data.get('due_date', 'Scheduled')
    mode = data.get('mode', 'caution')
    strategy = data.get('strategy', 'Request extension')
    
    prompt = f"""
    You are a professional financial assistant helping a small business manage cash flow.
    Write a concise, polite, and professional email.

    Context:
    - Vendor: {vendor_name}
    - Amount Due: {amount}
    - Due Date: {due_date}
    - Situation: {mode.upper()} mode
    - Strategy: {strategy}

    Instructions:
    - Keep it under 150 words
    - Maintain a respectful tone
    - Be clear and confident (not desperate)
    - Include a subject line
    - Provide only the final email (no explanations)
    """
    
    try:
        # We use a CLI prompt for llama3
        result = subprocess.run(
            ["ollama", "run", "llama3", prompt],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        
        output = result.stdout.strip()
        if not output:
             return {"success": False, "error": "Model returned empty response."}
        
        return {"success": True, "email": output}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    try:
        # Read from STDIN instead of args to avoid Windows escaping issues
        raw_input = sys.stdin.read()
        if not raw_input:
             print(json.dumps({"success": False, "error": "Empty input"}))
             sys.exit(0)
             
        input_data = json.loads(raw_input)
        result = generate_email(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Internal Script Error: {str(e)}"}))
