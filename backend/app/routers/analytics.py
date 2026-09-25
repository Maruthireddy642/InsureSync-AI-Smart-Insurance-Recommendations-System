from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.database import get_db
from app.services import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
def overview(db: Session = Depends(get_db), _user=Depends(require_roles("admin", "provider"))):
    return {
        "workflow": analytics_service.workflow_overview(db),
        "recommendations": analytics_service.recommendation_quality(db),
        "engagement": analytics_service.user_engagement(db),
    }
