"""
Insurance Recommendation Score (IRS) Engine
--------------------------------------------
RS = (w1 x CPF) + (w2 x BMS) + (w3 x CRS) - (w4 x PMC)

CPF - Coverage Fit Score     : how well policy limits/deductible match the
                                user's projected healthcare need (derived from
                                ML risk scores + age).
BMS - Benefits Matching Score: overlap between policy benefit tags and the
                                user's preferred benefits.
CRS - Claim Reliability Score: policy's historical claim approval rate and
                                average turnaround time.
PMC - Premium Cost Factor    : how much the premium eats into the user's
                                stated monthly budget (penalty term).

All sub-scores are normalized to a 0-100 scale before weighting so the final
RS is transparent and explainable to the end user.
"""
from dataclasses import dataclass

from app.models.health_profile import HealthProfile
from app.models.policy import Policy

# Default weights - tunable per business rules / A-B testing
WEIGHTS = {"w1": 0.35, "w2": 0.25, "w3": 0.25, "w4": 0.15}


@dataclass
class IRSResult:
    cpf: float
    bms: float
    crs: float
    pmc: float
    irs_score: float


def _coverage_fit_score(profile: HealthProfile, policy: Policy) -> float:
    """Higher projected risk needs higher coverage limits & lower deductibles."""
    overall_risk = (profile.diabetes_risk + profile.hypertension_risk + profile.heart_disease_risk) / 3
    # Normalize coverage limit against a realistic band (0 - 2,000,000)
    coverage_component = min(policy.coverage_limit / 2_000_000, 1.0)
    # Lower deductible is better, especially for high-risk users
    deductible_penalty = min(policy.deductible / 100_000, 1.0)

    fit = (0.6 * coverage_component + 0.4 * (1 - deductible_penalty))
    # Reward higher coverage more when risk is high
    fit_adjusted = fit * (0.7 + 0.3 * overall_risk)
    return round(min(fit_adjusted, 1.0) * 100, 2)


def _benefits_matching_score(profile: HealthProfile, policy: Policy) -> float:
    preferred = {b.strip().lower() for b in (profile.preferred_benefits or "").split(",") if b.strip()}
    offered = {b.strip().lower() for b in (policy.benefits or "").split(",") if b.strip()}
    if not preferred:
        return 60.0  # neutral baseline when the user hasn't specified preferences
    overlap = preferred.intersection(offered)
    score = (len(overlap) / len(preferred)) * 100
    if profile.family_history and "pre-existing" in offered.union({"preexisting"} if policy.covers_preexisting else set()):
        score = min(score + 10, 100)
    return round(score, 2)


def _claim_reliability_score(policy: Policy) -> float:
    approval_component = policy.claim_approval_rate * 100  # already 0-1
    # Faster average turnaround boosts reliability, cap benefit at 30 days
    speed_component = max(0, (30 - min(policy.avg_claim_days, 30)) / 30) * 100
    return round(0.7 * approval_component + 0.3 * speed_component, 2)


def _premium_cost_factor(profile: HealthProfile, policy: Policy) -> float:
    """Penalty term: how much of the user's budget the premium consumes.
    Unlike the other terms, this is intentionally NOT capped at 100 -
    a plan costing several times your budget should be penalized hard
    enough to lose to a plan you can actually afford, no matter how
    good its coverage looks."""
    if profile.monthly_budget <= 0:
        return 100.0
    ratio = policy.monthly_premium / profile.monthly_budget
    if ratio <= 1:
        penalty = ratio * 50
    else:
        penalty = 50 + (ratio - 1) * 100
    return round(penalty, 2)

def score_policy(profile: HealthProfile, policy: Policy, weights: dict = None) -> IRSResult:
    w = weights or WEIGHTS
    cpf = _coverage_fit_score(profile, policy)
    bms = _benefits_matching_score(profile, policy)
    crs = _claim_reliability_score(policy)
    pmc = _premium_cost_factor(profile, policy)

    irs = (w["w1"] * cpf) + (w["w2"] * bms) + (w["w3"] * crs) - (w["w4"] * pmc)
    irs = round(max(irs, 0), 2)

    return IRSResult(cpf=cpf, bms=bms, crs=crs, pmc=pmc, irs_score=irs)


def rank_policies(profile: HealthProfile, policies: list[Policy], weights: dict = None) -> list[tuple[Policy, IRSResult]]:
    scored = [(p, score_policy(profile, p, weights)) for p in policies]
    scored.sort(key=lambda pair: pair[1].irs_score, reverse=True)
    return scored
