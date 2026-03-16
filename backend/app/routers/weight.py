# app/routers/weight.py
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.weight_log import WeightLog
from app.models.user import User

router = APIRouter(prefix="/weight", tags=["Weight"])

@router.post("/log")
def log_weight(
    weight_kg: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    log = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == current_user.id,
            WeightLog.log_date == today,
        )
        .order_by(WeightLog.log_date.desc(), WeightLog.id.desc())
        .first()
    )

    if not log:
        log = WeightLog(
            user_id=current_user.id,
            weight_kg=weight_kg,
            log_date=today,
        )
        db.add(log)
    else:
        log.weight_kg = weight_kg

    db.commit()
    db.refresh(log)
    return {"id": log.id}
