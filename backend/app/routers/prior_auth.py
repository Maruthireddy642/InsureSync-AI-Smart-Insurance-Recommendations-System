from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.websocket_manager import manager
from app.database import get_db
from app.models.prior_auth import PriorAuthorization
from app.models.user import User
from app.schemas.workflow import PriorAuthIn, PriorAuthOut, PriorAuthStatusUpdate

router = APIRouter(prefix="/api/prior-auth", tags=["prior-authorization"])


@router.post("", response_model=PriorAuthOut)
async def submit_prior_auth(payload: PriorAuthIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pa = PriorAuthorization(
        user_id=user.id,
        procedure=payload.procedure,
        justification=payload.justification,
        urgency=payload.urgency,
    )
    db.add(pa)
    db.commit()
    db.refresh(pa)
    await manager.send_to_user(user.id, {"type": "prior_auth_submitted", "prior_auth_id": pa.id, "status": pa.status})
    return pa


@router.get("/mine", response_model=list[PriorAuthOut])
def my_prior_auths(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(PriorAuthorization).filter(PriorAuthorization.user_id == user.id).order_by(
        PriorAuthorization.created_at.desc()
    ).all()


@router.get("", response_model=list[PriorAuthOut])
def all_prior_auths(db: Session = Depends(get_db), _user: User = Depends(require_roles("provider", "admin"))):
    return db.query(PriorAuthorization).order_by(PriorAuthorization.created_at.desc()).all()


@router.patch("/{pa_id}/status", response_model=PriorAuthOut)
async def update_prior_auth_status(
    pa_id: int,
    payload: PriorAuthStatusUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("provider", "admin")),
):
    pa = db.query(PriorAuthorization).filter(PriorAuthorization.id == pa_id).first()
    if not pa:
        raise HTTPException(status_code=404, detail="Prior authorization not found")

    pa.status = payload.status
    pa.reviewer_notes = payload.reviewer_notes
    db.commit()
    db.refresh(pa)

    await manager.send_to_user(
        pa.user_id, {"type": "prior_auth_status_update", "prior_auth_id": pa.id, "status": pa.status}
    )
    return pa
