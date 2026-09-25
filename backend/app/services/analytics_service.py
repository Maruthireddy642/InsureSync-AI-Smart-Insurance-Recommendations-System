from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.claim import Claim
from app.models.prior_auth import PriorAuthorization
from app.models.recommendation import Recommendation
from app.models.user import User


def workflow_overview(db: Session) -> dict:
    claim_counts = dict(db.query(Claim.status, func.count(Claim.id)).group_by(Claim.status).all())
    pa_counts = dict(
        db.query(PriorAuthorization.status, func.count(PriorAuthorization.id))
        .group_by(PriorAuthorization.status)
        .all()
    )
    avg_claim_amount = db.query(func.avg(Claim.amount_claimed)).scalar() or 0

    return {
        "claims_by_status": claim_counts,
        "prior_auth_by_status": pa_counts,
        "avg_claim_amount": round(float(avg_claim_amount), 2),
        "total_claims": db.query(func.count(Claim.id)).scalar() or 0,
        "total_prior_auths": db.query(func.count(PriorAuthorization.id)).scalar() or 0,
    }


def recommendation_quality(db: Session) -> dict:
    avg_scores = db.query(
        func.avg(Recommendation.irs_score),
        func.avg(Recommendation.cpf),
        func.avg(Recommendation.bms),
        func.avg(Recommendation.crs),
        func.avg(Recommendation.pmc),
    ).first()

    top_recs = (
        db.query(Recommendation).order_by(Recommendation.irs_score.desc()).limit(5).all()
    )

    return {
        "avg_irs_score": round(float(avg_scores[0] or 0), 2),
        "avg_cpf": round(float(avg_scores[1] or 0), 2),
        "avg_bms": round(float(avg_scores[2] or 0), 2),
        "avg_crs": round(float(avg_scores[3] or 0), 2),
        "avg_pmc": round(float(avg_scores[4] or 0), 2),
        "total_recommendations": db.query(func.count(Recommendation.id)).scalar() or 0,
    }


def user_engagement(db: Session) -> dict:
    by_role = dict(db.query(User.role, func.count(User.id)).group_by(User.role).all())
    return {"users_by_role": by_role, "total_users": db.query(func.count(User.id)).scalar() or 0}
