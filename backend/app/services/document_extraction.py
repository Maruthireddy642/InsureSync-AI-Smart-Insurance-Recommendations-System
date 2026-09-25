"""
Extracts health-profile fields from uploaded documents (bank statement,
health report, habits log) using lightweight heuristic text parsing.

This is intentionally simple and dependency-light: it looks for common
patterns (e.g. "Age: 34", "BMI 24.5", "Monthly Income: Rs 45,000") rather
than using a full NLP/LLM pipeline, so it works offline and is easy to
reason about. Any field it can't find falls back to a sensible default,
so the endpoint never crashes on unexpected document formats - it just
produces a best-effort profile the user can still edit manually afterward.
"""
import io
import re

from fastapi import UploadFile


def _decode(raw: bytes) -> str:
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("latin-1", errors="ignore")


async def read_upload(file: UploadFile) -> str:
    """Reads an uploaded file and returns its text content.
    Supports .pdf (via pypdf, if installed) and plain text formats
    (.txt, .csv, .md), with a best-effort fallback for anything else."""
    raw = await file.read()
    if not raw:
        raise ValueError(f"{file.filename} is empty")

    name = (file.filename or "").lower()
    content_type = (file.content_type or "").lower()

    if name.endswith(".pdf") or "pdf" in content_type:
        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise RuntimeError(
                "PDF support requires the 'pypdf' package. Run: pip install pypdf"
            ) from exc
        try:
            reader = PdfReader(io.BytesIO(raw))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as exc:
            raise RuntimeError(f"Could not read {file.filename} as a PDF") from exc
        if not text.strip():
            raise RuntimeError(f"No extractable text found in {file.filename}")
        return text

    # Plain text, CSV, markdown, or anything else - best-effort decode
    try:
        return _decode(raw)
    except Exception as exc:
        raise ValueError(f"Unsupported file type for {file.filename}") from exc


def _find_number(pattern: str, text: str, default=None):
    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        return default
    try:
        return float(match.group(1).replace(",", ""))
    except (ValueError, IndexError):
        return default


def _mentions_any(keywords: list[str], text: str) -> bool:
    text_lower = text.lower()
    return any(k in text_lower for k in keywords)


BENEFIT_KEYWORDS = {
    "dental": ["dental", "tooth", "teeth"],
    "maternity": ["maternity", "pregnan", "prenatal"],
    "wellness": ["wellness", "gym", "fitness", "wellbeing"],
    "mental_health": ["mental health", "therapy", "counsel", "psychiat"],
    "teleconsult": ["teleconsult", "telehealth", "video consult", "online doctor"],
    "pre-existing": ["pre-existing", "preexisting", "chronic condition"],
}


def build_health_profile_fields(bank_text: str, health_text: str, habits_text: str) -> dict:
    """Combines heuristics across the three documents into the same field
    shape HealthProfileIn expects, so it can be saved via the existing
    _save_health_profile() logic without any special-casing."""

    age = _find_number(r"age[:\s]+(\d{1,3})", health_text, default=30)
    bmi = _find_number(r"bmi[:\s]+([\d.]+)", health_text, default=24.0)
    systolic_bp = _find_number(
        r"(?:systolic|blood pressure|bp)[:\s]+(\d{2,3})", health_text, default=118
    )
    glucose = _find_number(r"glucose[:\s]+([\d.]+)", health_text, default=95)

    smoker = _mentions_any(
        ["smoker: yes", "smokes regularly", "current smoker", "smoking: yes"],
        health_text + " " + habits_text,
    )
    family_history = _mentions_any(
        ["family history: yes", "family history of", "hereditary"], health_text
    )

    explicit_budget = _find_number(
        r"(?:insurance budget|monthly budget)[:\s\u20b9]*([\d,]+)", bank_text
    )
    monthly_income = _find_number(
        r"(?:monthly income|net salary|salary credited)[:\s\u20b9]*([\d,]+)", bank_text
    )
    if explicit_budget:
        monthly_budget = explicit_budget
    elif monthly_income:
        monthly_budget = round(monthly_income * 0.1, -1)
    else:
        monthly_budget = 2500

    combined_lower = (health_text + " " + habits_text).lower()
    preferred_benefits = [
        tag
        for tag, keywords in BENEFIT_KEYWORDS.items()
        if any(k in combined_lower for k in keywords)
    ]

    return {
        "age": int(age),
        "bmi": round(float(bmi), 1),
        "systolic_bp": int(systolic_bp),
        "glucose_level": round(float(glucose), 1),
        "smoker": smoker,
        "family_history": family_history,
        "monthly_budget": float(monthly_budget),
        "preferred_benefits": preferred_benefits,
    }