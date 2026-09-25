from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class PriorAuthorization(Base):
    __tablename__ = "prior_authorizations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    procedure = Column(String, nullable=False)
    justification = Column(Text, nullable=False)
    urgency = Column(String, default="routine")  # routine|urgent|emergency
    status = Column(String, default="pending")  # pending|approved|denied|more_info_needed
    reviewer_notes = Column(Text, default="")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="prior_auths")
