from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.health_profile import HealthProfile
from app.models.user import User
from app.schemas.user import HealthProfileIn, HealthProfileOut, UserOut
from app.services.document_extraction import build_health_profile_fields, read_upload
from app.services.ml_risk import predict_risks

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.get("/me/health-profile", response_model=HealthProfileOut | None)
def get_health_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()


def _save_health_profile(fields: dict, user: User, db: Session) -> HealthProfile:
    """Shared upsert logic used by both the manual-entry route and the
    document-analysis route below, so risk scoring stays in one place."""

    risks = predict_risks(
        age=fields["age"],
        bmi=fields["bmi"],
        systolic_bp=fields["systolic_bp"],
        glucose_level=fields["glucose_level"],
        smoker=fields["smoker"],
        family_history=fields["family_history"],
    )

    profile = db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()
    if not profile:
        profile = HealthProfile(user_id=user.id)
        db.add(profile)

    profile.age = fields["age"]
    profile.bmi = fields["bmi"]
    profile.systolic_bp = fields["systolic_bp"]
    profile.glucose_level = fields["glucose_level"]
    profile.smoker = int(fields["smoker"])
    profile.family_history = int(fields["family_history"])
    profile.monthly_budget = fields["monthly_budget"]
    profile.preferred_benefits = ",".join(fields["preferred_benefits"])
    profile.diabetes_risk = risks["diabetes_risk"]
    profile.hypertension_risk = risks["hypertension_risk"]
    profile.heart_disease_risk = risks["heart_disease_risk"]

    db.commit()
    db.refresh(profile)
    return profile


@router.put("/me/health-profile", response_model=HealthProfileOut)
def upsert_health_profile(
    payload: HealthProfileIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fields = {
        "age": payload.age,
        "bmi": payload.bmi,
        "systolic_bp": payload.systolic_bp,
        "glucose_level": payload.glucose_level,
        "smoker": payload.smoker,
        "family_history": payload.family_history,
        "monthly_budget": payload.monthly_budget,
        "preferred_benefits": payload.preferred_benefits,
    }
    return _save_health_profile(fields, user, db)


@router.post("/me/health-profile/analyze", response_model=HealthProfileOut)
async def analyze_health_profile(
    bank_statement: UploadFile = File(...),
    health_report: UploadFile = File(...),
    habits_log: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Accepts the three documents the frontend upload UI collects, extracts
    the fields HealthProfileIn needs via heuristic text parsing, computes
    risk the same way the manual-entry route does, and saves the profile."""

    try:
        bank_text = await read_upload(bank_statement)
        health_text = await read_upload(health_report)
        habits_text = await read_upload(habits_log)
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    fields = build_health_profile_fields(bank_text, health_text, habits_text)
    return _save_health_profile(fields, user, db)