from datetime import datetime

from pydantic import BaseModel


class ClaimIn(BaseModel):
    description: str
    amount_claimed: float
    policy_id: int | None = None


class ClaimStatusUpdate(BaseModel):
    status: str
    reviewer_notes: str = ""


class ClaimOut(BaseModel):
    id: int
    user_id: int
    description: str
    amount_claimed: float
    status: str
    reviewer_notes: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PriorAuthIn(BaseModel):
    procedure: str
    justification: str
    urgency: str = "routine"


class PriorAuthStatusUpdate(BaseModel):
    status: str
    reviewer_notes: str = ""


class PriorAuthOut(BaseModel):
    id: int
    user_id: int
    procedure: str
    justification: str
    urgency: str
    status: str
    reviewer_notes: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
