from pydantic import BaseModel


class PolicyOut(BaseModel):
    id: int
    provider_name: str
    plan_name: str
    monthly_premium: float
    coverage_limit: float
    deductible: float
    claim_approval_rate: float
    avg_claim_days: int
    benefits: str
    covers_preexisting: bool
    tier: str

    class Config:
        from_attributes = True


class RecommendationOut(BaseModel):
    policy: PolicyOut
    cpf: float
    bms: float
    crs: float
    pmc: float
    irs_score: float

    class Config:
        from_attributes = True
