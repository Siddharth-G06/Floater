from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


# ─────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────

class TransactionType(str, Enum):
    inflow = "inflow"
    outflow = "outflow"


class TransactionCategory(str, Enum):
    salary = "salary"
    tax = "tax"
    rent = "rent"
    utility = "utility"
    loan_repayment = "loan_repayment"
    loan_disbursement = "loan_disbursement"
    gst_refund = "gst_refund"
    advance_received = "advance_received"
    advance_paid = "advance_paid"
    sales_receipt = "sales_receipt"
    invoice = "invoice"


class RiskMode(str, Enum):
    stable = "stable"
    caution = "caution"
    emergency = "emergency"


# ─────────────────────────────────────────────
# OCR / DOCUMENT EXTRACTION
# ─────────────────────────────────────────────

class ExtractedReceipt(BaseModel):
    vendor_name: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = "unclear"
    description: Optional[str] = None
    payment_type: Optional[str] = "unclear"
    confidence_score: float = 0.0
    unclear_fields: List[str] = []


class ExtractedInvoice(BaseModel):
    vendor_name: Optional[str] = None
    customer_name: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    total_amount: Optional[float] = None
    gst_number: Optional[str] = None
    is_msme_registered: Optional[bool] = False
    confidence_score: float = 0.0


# ─────────────────────────────────────────────
# CSV / BANK PARSING
# ─────────────────────────────────────────────

class ParsedCSVRow(BaseModel):
    date: str
    counterparty_name: str
    amount: float
    type: TransactionType
    category: TransactionCategory
    narration: Optional[str] = None


# ─────────────────────────────────────────────
# CORE TRANSACTION MODEL
# ─────────────────────────────────────────────

class Transaction(BaseModel):
    id: Optional[str] = None
    counterparty_name: str
    amount: float
    due_date: Optional[str] = None
    type: TransactionType = TransactionType.outflow
    category: TransactionCategory = TransactionCategory.invoice
    priority_score: Optional[float] = 0.0
    is_paid: bool = False


# ─────────────────────────────────────────────
# DECISION ENGINE OUTPUT
# ─────────────────────────────────────────────

class PaymentDecision(BaseModel):
    transaction_id: str
    action: str  # pay_now / delay / partial_pay
    recommended_amount: Optional[float] = None
    delay_days: Optional[int] = None
    reason: Optional[str] = None


class SimulationResult(BaseModel):
    days_to_zero: int
    risk_mode: RiskMode
    decisions: List[PaymentDecision]


# ─────────────────────────────────────────────
# EMAIL GENERATION
# ─────────────────────────────────────────────

class EmailRequest(BaseModel):
    vendor_name: str
    amount: float
    due_date: str
    mode: RiskMode
    strategy: Optional[str] = None


class GeneratedEmail(BaseModel):
    subject: str
    body: str
