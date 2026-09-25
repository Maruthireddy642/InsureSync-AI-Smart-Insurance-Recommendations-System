from pydantic import BaseModel


class HealthProfileIn(BaseModel):
    age: int
    bmi: float
    systolic_bp: int
    glucose_level: float
    smoker: bool = False
    family_history: bool = False
    monthly_budget: float
    preferred_benefits: list[str] = []


class HealthProfileOut(BaseModel):
    age: int
    bmi: float
    systolic_bp: int
    glucose_level: float
    smoker: bool
    family_history: bool
    monthly_budget: float
    preferred_benefits: str
    diabetes_risk: float
    hypertension_risk: float
    heart_disease_risk: float

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True
