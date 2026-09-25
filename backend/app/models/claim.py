from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=True)

    description = Column(Text, nullable=False)
    amount_claimed = Column(Float, nullable=False)
    status = Column(String, default="submitted")  # submitted|under_review|approved|rejected|paid
    reviewer_notes = Column(Text, default="")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="claims")
