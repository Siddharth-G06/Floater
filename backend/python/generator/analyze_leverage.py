import sys
import json
import subprocess

def analyze_leverage(data):
    vendors = data.get('vendors', [])
    
    # Calculate stats
    strong = [v for v in vendors if v['score'] >= 80]
    unstable = [v for v in vendors if v['score'] < 50]
    total = len(vendors)
    
    summary_stats = f"Total Vendors: {total}. Strong: {len(strong)}. Unstable: {len(unstable)}."
    
    prompt = f"""
    You are a strategic financial advisor for a small business.
    Analyze the following vendor relationship data and provide actionable leverage insights.

    Data:
    {summary_stats}
    
    Detailed Vendors:
    {json.dumps(vendors[:10], indent=2)}

    Requirements:
    1. Identify 'Extension Power' (which vendors can you delay payments with?)
    2. Identify 'Critical Friction' (which vendors are dangerous to delay?)
    3. Project overall 'Negotiation Leverage Score' (0-100).
    4. Provide 2-3 specific strategy bullets.

    Response format:
    Provide a professional, concise executive summary (max 200 words).
    End with a clear 'Actionable Strategy' section.
    """
    
    try:
        result = subprocess.run(
            ["ollama", "run", "llama3", prompt],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        
        output = result.stdout.strip()
        if not output:
             return {"success": False, "error": "Model response empty"}
        
        return {"success": True, "analysis": output}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
             print(json.dumps({"success": False, "error": "No input"}))
             sys.exit(0)
             
        input_data = json.loads(raw_input)
        result = analyze_leverage(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
