import pytesseract
from PIL import Image
import re
import sys
import os

# Fix import path (look one level up to find 'models')
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.schemas import ExtractedReceipt

# 👉 Set your Tesseract path (adjust if needed)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text_from_image(image_path: str) -> str:
    """OCR extraction using Tesseract"""
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, config="--psm 6")
        
        # Output info to stderr so it doesn't break JSON parsing in Node stdout
        sys.stderr.write("\n🧾 RAW OCR TEXT:\n")
        sys.stderr.write(text + "\n")
        sys.stderr.flush()
        
        return text
    except Exception as e:
        sys.stderr.write(f"Error reading image: {e}\n")
        return ""


def extract_receipt_from_image(image_path: str) -> ExtractedReceipt:
    """Full OCR → structured extraction"""

    text = extract_text_from_image(image_path)

    try:
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        # ---------- AMOUNT ----------
        amount = None
        priority_keywords = ["total", "amount due", "subtotal"]

        for line in lines:
            lower = line.lower()
            if any(k in lower for k in priority_keywords):
                match = re.search(r"(\d+\.\d{2})", line)
                if match:
                    amount = float(match.group())
                    break

        # fallback
        if amount is None:
            matches = re.findall(r"\d+\.\d{2}", text)
            if matches:
                amount = max([float(m) for m in matches])

        # ---------- DATE ----------
        date = "unclear"

        # format: 20/03/2026
        date_match = re.search(r"\d{2}[/-]\d{2}[/-]\d{2,4}", text)
        if date_match:
            date = date_match.group()
        else:
            # format: December 3, 2024
            date_match = re.search(r"[A-Za-z]+ \d{1,2}, \d{4}", text)
            if date_match:
                date = date_match.group()

        # ---------- VENDOR ----------
        vendor = None

        for i, line in enumerate(lines):
            lower = line.lower()

            # Case 1: "Invoice XYZ"
            if "invoice" in lower and len(line.split()) <= 3:
                parts = line.split()
                if len(parts) > 1:
                    vendor = " ".join(parts[1:])
                    break

            # Case 2: Next line after invoice
            if "invoice" in lower and i + 1 < len(lines):
                next_line = lines[i + 1]
                if not any(x in next_line.lower() for x in ["date", "number"]):
                    vendor = next_line
                    break

        # Fallback
        if not vendor:
            for line in lines:
                if (
                    len(line) > 3
                    and not any(x in line.lower() for x in ["date", "invoice", "total", "amount"])
                    and not re.search(r"\d{3,}", line)
                ):
                    vendor = line
                    break

        return ExtractedReceipt(
            vendor_name=vendor,
            amount=amount,
            date=date,
            description="Extracted via Tesseract OCR",
            payment_type="unclear",
            confidence_score=0.9 if amount else 0.6,
            unclear_fields=[] if amount else ["amount"]
        )

    except Exception as e:
        sys.stderr.write(f"❌ Error: {e}\n")

        return ExtractedReceipt(
            vendor_name=None,
            amount=None,
            date="unclear",
            description=None,
            payment_type="unclear",
            confidence_score=0.1,
            unclear_fields=["all"]
        )
