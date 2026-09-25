from sqlalchemy import Column, Float, Integer, String

from app.database import Base


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    provider_name = Column(String, nullable=False)
    plan_name = Column(String, nullable=False)
    monthly_premium = Column(Float, nullable=False)
    coverage_limit = Column(Float, nullable=False)
    deductible = Column(Float, nullable=False)
    claim_approval_rate = Column(Float, nullable=False)  # 0-1, historical reliability
    avg_claim_days = Column(Integer, nullable=False)
    benefits = Column(String, default="")  # comma separated: dental,maternity,wellness,mental_health...
    covers_preexisting = Column(Integer, default=0)
    tier = Column(String, default="standard")  # basic | standard | premium
