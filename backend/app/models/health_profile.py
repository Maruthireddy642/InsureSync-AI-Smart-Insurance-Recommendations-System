from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    age = Column(Integer, nullable=False)
    bmi = Column(Float, nullable=False)
    systolic_bp = Column(Integer, nullable=False)
    glucose_level = Column(Float, nullable=False)
    smoker = Column(Integer, default=0)  # 0/1
    family_history = Column(Integer, default=0)  # 0/1
    monthly_budget = Column(Float, nullable=False)
    preferred_benefits = Column(String, default="")  # comma separated tags

    # Populated by the ML risk classifier
    diabetes_risk = Column(Float, default=0.0)
    hypertension_risk = Column(Float, default=0.0)
    heart_disease_risk = Column(Float, default=0.0)

    user = relationship("User", back_populates="health_profile")
