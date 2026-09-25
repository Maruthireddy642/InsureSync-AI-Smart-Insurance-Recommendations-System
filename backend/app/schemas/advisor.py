from pydantic import BaseModel


class AdvisorMessageIn(BaseModel):
    message: str


class AdvisorMessageOut(BaseModel):
    reply: str
    source: str  # "llm" | "rule_based"
