# app/routers/analytics.py (or weight.py)
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.weight_log import WeightLog

router = APIRouter()

class WeightUpdate(BaseModel):
    weight_kg: float
    log_date: date | None = None

@router.post("/weight")
def add_weight_log(
    data: WeightUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resolved_date = data.log_date or date.today()
    log = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == current_user.id,
            WeightLog.log_date == resolved_date,
        )
        .order_by(WeightLog.log_date.desc(), WeightLog.id.desc())
        .first()
    )

    if not log:
        log = WeightLog(
            user_id=current_user.id,
            weight_kg=data.weight_kg,
            log_date=resolved_date,
        )
        db.add(log)
    else:
        log.weight_kg = data.weight_kg

    db.commit()
    db.refresh(log)
    return {"id": log.id}
