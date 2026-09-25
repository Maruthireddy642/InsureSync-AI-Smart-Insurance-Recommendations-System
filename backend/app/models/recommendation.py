from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)

    cpf = Column(Float, nullable=False)  # Coverage Fit Score
    bms = Column(Float, nullable=False)  # Benefits Matching Score
    crs = Column(Float, nullable=False)  # Claim Reliability Score
    pmc = Column(Float, nullable=False)  # Premium Cost Factor (penalty)
    irs_score = Column(Float, nullable=False)  # final RS

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")
    policy = relationship("Policy")
