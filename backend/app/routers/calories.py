# app/routers/calories.py
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.calorie_log import CalorieLog
from app.models.user import User

router = APIRouter(prefix="/calories", tags=["Calories"])

@router.post("/log")
def log_calories(
    calories_consumed: int,
    calories_target: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    log = (
        db.query(CalorieLog)
        .filter(
            CalorieLog.user_id == current_user.id,
            CalorieLog.log_date == today,
        )
        .order_by(CalorieLog.log_date.desc(), CalorieLog.id.desc())
        .first()
    )

    if not log:
        log = CalorieLog(
            user_id=current_user.id,
            log_date=today,
            calories_consumed=calories_consumed,
            calories_target=calories_target or 0,
        )
        db.add(log)
    else:
        log.calories_consumed = calories_consumed
        if calories_target is not None:
            log.calories_target = calories_target

    db.commit()
    db.refresh(log)
    return {"id": log.id}
