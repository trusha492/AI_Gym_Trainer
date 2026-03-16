# app/routers/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.core.dependencies import get_db, get_current_user
from app.models.calorie_log import CalorieLog
from app.models.weight_log import WeightLog
from app.models.user import User

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/dashboard")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # latest weight
    latest_weight = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == current_user.id)
        .order_by(WeightLog.log_date.desc())
        .first()
    )

    # weight a week ago
    week_ago = date.today() - timedelta(days=7)
    week_ago_weight = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == current_user.id,
            WeightLog.log_date <= week_ago,
        )
        .order_by(WeightLog.log_date.desc())
        .first()
    )

    # today calories
    today = date.today()
    today_cal = (
        db.query(CalorieLog)
        .filter(
            CalorieLog.user_id == current_user.id,
            CalorieLog.log_date == today,
        )
        .order_by(CalorieLog.log_date.desc(), CalorieLog.id.desc())
        .first()
    )

    return {
        "current_weight": latest_weight.weight_kg if latest_weight else None,
        "weight_change_week": (
            latest_weight.weight_kg - week_ago_weight.weight_kg
            if latest_weight and week_ago_weight
            else None
        ),
        "calories_today": today_cal.calories_consumed if today_cal else None,
        "calories_target": today_cal.calories_target if today_cal else None,
    }
