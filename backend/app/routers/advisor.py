from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.health_profile import HealthProfile
from app.models.user import User
from app.schemas.advisor import AdvisorMessageIn, AdvisorMessageOut
from app.services.llm_advisor import get_advisor_reply

router = APIRouter(prefix="/api/advisor", tags=["advisor"])


@router.post("/chat", response_model=AdvisorMessageOut)
def chat(payload: AdvisorMessageIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()
    context = {"role": user.role}
    if profile:
        context.update(
            {
                "diabetes_risk": profile.diabetes_risk,
                "hypertension_risk": profile.hypertension_risk,
                "heart_disease_risk": profile.heart_disease_risk,
                "monthly_budget": profile.monthly_budget,
            }
        )
    reply, source = get_advisor_reply(payload.message, context)
    return AdvisorMessageOut(reply=reply, source=source)
