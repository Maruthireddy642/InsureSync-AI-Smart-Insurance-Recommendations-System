from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.health_profile import HealthProfile
from app.models.policy import Policy
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.policy import RecommendationOut
from app.services.irs_engine import rank_policies

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("", response_model=list[RecommendationOut])
def get_recommendations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Complete your health profile first")

    policies = db.query(Policy).all()
    if not policies:
        raise HTTPException(status_code=404, detail="No policies available")

    ranked = rank_policies(profile, policies)

    # Persist the latest recommendation run for analytics
    db.query(Recommendation).filter(Recommendation.user_id == user.id).delete()
    for policy, result in ranked:
        db.add(
            Recommendation(
                user_id=user.id,
                policy_id=policy.id,
                cpf=result.cpf,
                bms=result.bms,
                crs=result.crs,
                pmc=result.pmc,
                irs_score=result.irs_score,
            )
        )
    db.commit()

    return [
        RecommendationOut(policy=policy, cpf=r.cpf, bms=r.bms, crs=r.crs, pmc=r.pmc, irs_score=r.irs_score)
        for policy, r in ranked
    ]
