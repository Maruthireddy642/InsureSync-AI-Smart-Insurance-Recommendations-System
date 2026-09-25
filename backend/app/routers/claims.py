from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.websocket_manager import manager
from app.database import get_db
from app.models.claim import Claim
from app.models.user import User
from app.schemas.workflow import ClaimIn, ClaimOut, ClaimStatusUpdate

router = APIRouter(prefix="/api/claims", tags=["claims"])

VALID_TRANSITIONS = {
    "submitted": {"under_review", "rejected"},
    "under_review": {"approved", "rejected"},
    "approved": {"paid"},
    "rejected": set(),
    "paid": set(),
}


@router.post("", response_model=ClaimOut)
async def submit_claim(payload: ClaimIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    claim = Claim(user_id=user.id, description=payload.description, amount_claimed=payload.amount_claimed, policy_id=payload.policy_id)
    db.add(claim)
    db.commit()
    db.refresh(claim)
    await manager.send_to_user(user.id, {"type": "claim_submitted", "claim_id": claim.id, "status": claim.status})
    return claim


@router.get("/mine", response_model=list[ClaimOut])
def my_claims(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Claim).filter(Claim.user_id == user.id).order_by(Claim.created_at.desc()).all()


@router.get("", response_model=list[ClaimOut])
def all_claims(db: Session = Depends(get_db), _user: User = Depends(require_roles("provider", "admin"))):
    return db.query(Claim).order_by(Claim.created_at.desc()).all()


@router.patch("/{claim_id}/status", response_model=ClaimOut)
async def update_claim_status(
    claim_id: int,
    payload: ClaimStatusUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("provider", "admin")),
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    allowed_next = VALID_TRANSITIONS.get(claim.status, set())
    if payload.status not in allowed_next:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot move claim from '{claim.status}' to '{payload.status}'",
        )

    claim.status = payload.status
    claim.reviewer_notes = payload.reviewer_notes
    db.commit()
    db.refresh(claim)

    await manager.send_to_user(
        claim.user_id, {"type": "claim_status_update", "claim_id": claim.id, "status": claim.status}
    )
    return claim
