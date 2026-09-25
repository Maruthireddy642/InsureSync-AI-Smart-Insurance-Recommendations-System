"""
Conversational advisor used for policy explanation, medical document
summarization, and general user guidance in plain language.

Design: pluggable LLM backend. If OPENAI_API_KEY is configured, real calls
are made to the chat completion endpoint using a structured system prompt.
Otherwise the advisor falls back to a template/rule-based engine so the
whole platform stays demoable without any external API key.
"""
from app.config import settings

SYSTEM_PROMPT = (
    "You are InsureSync AI's advisor. Explain health insurance policies, claims, "
    "and prior-authorization concepts in plain, friendly language. Be concise, "
    "avoid jargon, and never fabricate coverage details that weren't provided."
)


def _rule_based_reply(message: str) -> str:
    text = message.lower()

    if any(k in text for k in ["deductible"]):
        return (
            "Your deductible is the amount you pay out-of-pocket before your insurance "
            "starts covering costs. A lower deductible usually means a higher monthly "
            "premium, and vice versa."
        )
    if any(k in text for k in ["premium"]):
        return (
            "The premium is the amount you pay every month to keep your policy active, "
            "regardless of whether you file a claim. Our IRS engine weighs this against "
            "your stated budget as the Premium Cost Factor (PMC)."
        )
    if any(k in text for k in ["claim", "reimburse"]):
        return (
            "To file a claim, go to Claims & Workflow, submit a description and the "
            "amount, and track its status live: submitted -> under review -> approved/"
            "rejected -> paid. You'll get a real-time notification at every step."
        )
    if any(k in text for k in ["prior auth", "authorization", "pre-approval", "preapproval"]):
        return (
            "Prior authorization is your insurer's pre-approval for certain procedures "
            "before you receive them. Submit the procedure name and medical "
            "justification under Prior Authorization, and mark it urgent or emergency "
            "if time-sensitive."
        )
    if any(k in text for k in ["irs", "score", "recommend"]):
        return (
            "Our Insurance Recommendation Score blends four factors: how well the plan "
            "covers your health needs (CPF), how well its benefits match your "
            "preferences (BMS), the insurer's claim reliability (CRS), minus a penalty "
            "for how much the premium strains your budget (PMC). Higher is better."
        )
    if any(k in text for k in ["risk", "diabetes", "hypertension", "heart"]):
        return (
            "We estimate your diabetes, hypertension, and heart-disease risk from your "
            "health profile using machine-learning classifiers. These risk levels feed "
            "into your Coverage Fit Score so higher-risk profiles get steered toward "
            "plans with stronger coverage."
        )
    return (
        "I can help explain your policy, claims, prior authorizations, or your "
        "recommendation score. Could you tell me a bit more about what you'd like to "
        "understand?"
    )


def get_advisor_reply(message: str, context: dict | None = None) -> tuple[str, str]:
    """Returns (reply, source) where source is 'llm' or 'rule_based'."""
    if settings.openai_api_key:
        try:
            from openai import OpenAI

            client = OpenAI(api_key=settings.openai_api_key)
            context_str = ""
            if context:
                context_str = "\n\nUser context: " + ", ".join(f"{k}={v}" for k, v in context.items())

            response = client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT + context_str},
                    {"role": "user", "content": message},
                ],
                max_tokens=400,
            )
            return response.choices[0].message.content.strip(), "llm"
        except Exception:
            # Fall through to rule-based reply on any API/network error
            return _rule_based_reply(message), "rule_based"

    return _rule_based_reply(message), "rule_based"
