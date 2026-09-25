from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.policy import Policy
from app.schemas.policy import PolicyOut

router = APIRouter(prefix="/api/policies", tags=["policies"])


@router.get("", response_model=list[PolicyOut])
def list_policies(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(Policy).all()
