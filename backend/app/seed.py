"""Run with: python -m app.seed
Creates demo accounts (customer/provider/admin) and a realistic policy catalog
so the platform is fully explorable immediately after setup.
"""
from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models.policy import Policy
from app.models.user import User

DEMO_USERS = [
    {"full_name": "Maruthi reddy", "email": "maruthireddy43@gmail.com", "password": "maruthi@123", "role": "customer"},
    {"full_name": "Nandan G", "email": "suryanandu43@gmail.com", "password": "nandan@123", "role": "provider"},
    {"full_name": "Shivaprasad M S", "email": "keerthiakash49@gmail.com", "password": "keerthiakash@02", "role": "admin"},
]

POLICIES = [
    dict(provider_name="Sanctuary Health", plan_name="EssentialCare Basic", monthly_premium=1200, coverage_limit=300000,
         deductible=15000, claim_approval_rate=0.82, avg_claim_days=12, benefits="wellness,teleconsult", covers_preexisting=0, tier="basic"),
    dict(provider_name="Sanctuary Health", plan_name="EssentialCare Plus", monthly_premium=2100, coverage_limit=600000,
         deductible=10000, claim_approval_rate=0.87, avg_claim_days=9, benefits="wellness,teleconsult,dental", covers_preexisting=0, tier="standard"),
    dict(provider_name="Northbridge Mutual", plan_name="FamilyShield 500", monthly_premium=2800, coverage_limit=800000,
         deductible=8000, claim_approval_rate=0.91, avg_claim_days=7, benefits="dental,maternity,wellness", covers_preexisting=1, tier="standard"),
    dict(provider_name="Northbridge Mutual", plan_name="FamilyShield Premier", monthly_premium=4200, coverage_limit=1500000,
         deductible=5000, claim_approval_rate=0.94, avg_claim_days=5, benefits="dental,maternity,wellness,mental_health,pre-existing", covers_preexisting=1, tier="premium"),
    dict(provider_name="Everline Assurance", plan_name="CorePlan 250", monthly_premium=900, coverage_limit=250000,
         deductible=20000, claim_approval_rate=0.75, avg_claim_days=15, benefits="teleconsult", covers_preexisting=0, tier="basic"),
    dict(provider_name="Everline Assurance", plan_name="ActiveLife Gold", monthly_premium=3300, coverage_limit=1000000,
         deductible=6000, claim_approval_rate=0.89, avg_claim_days=8, benefits="wellness,mental_health,dental", covers_preexisting=1, tier="premium"),
    dict(provider_name="Meridian Trust", plan_name="SecureBase", monthly_premium=1500, coverage_limit=400000,
         deductible=12000, claim_approval_rate=0.80, avg_claim_days=11, benefits="wellness", covers_preexisting=0, tier="basic"),
    dict(provider_name="Meridian Trust", plan_name="SecureElite 2M", monthly_premium=5200, coverage_limit=2000000,
         deductible=3000, claim_approval_rate=0.96, avg_claim_days=4, benefits="dental,maternity,wellness,mental_health,pre-existing,teleconsult", covers_preexisting=1, tier="premium"),
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            for u in DEMO_USERS:
                db.add(User(full_name=u["full_name"], email=u["email"], hashed_password=hash_password(u["password"]), role=u["role"]))
            print("Seeded demo users:")
            for u in DEMO_USERS:
                print(f"  {u['role']:10s} -> {u['email']} / {u['password']}")
        else:
            print("Users already exist, skipping user seed.")

        if db.query(Policy).count() == 0:
            for p in POLICIES:
                db.add(Policy(**p))
            print(f"Seeded {len(POLICIES)} policies.")
        else:
            print("Policies already exist, skipping policy seed.")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
