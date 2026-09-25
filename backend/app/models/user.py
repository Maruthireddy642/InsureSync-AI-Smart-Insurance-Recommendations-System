from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="customer")  # customer | provider | admin
    created_at = Column(DateTime, default=datetime.utcnow)

    health_profile = relationship("HealthProfile", back_populates="user", uselist=False)
    claims = relationship("Claim", back_populates="user")
    prior_auths = relationship("PriorAuthorization", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
