# app/routers/nutrition.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.dependencies import get_db, get_current_user
from app.models.calorie_log import CalorieLog
from app.models.weight_log import WeightLog
from app.schemas.nutrition import NutritionHistoryItem
from app.models.user import User

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


@router.get("/history", response_model=List[NutritionHistoryItem])
def get_nutrition_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = (
        db.query(
            CalorieLog.id.label("id"),
            CalorieLog.log_date.label("log_date"),
            CalorieLog.calories_consumed.label("calories_consumed"),
            CalorieLog.calories_target.label("calories_target"),
            CalorieLog.protein_g.label("protein_g"),
            CalorieLog.carbs_g.label("carbs_g"),
            CalorieLog.fats_g.label("fats_g"),
            WeightLog.weight_kg.label("weight_kg"),
        )
        .outerjoin(
            WeightLog,
            and_(
                CalorieLog.user_id == WeightLog.user_id,
                CalorieLog.log_date == WeightLog.log_date,
            ),
        )
        .filter(CalorieLog.user_id == current_user.id)
        .order_by(CalorieLog.log_date.desc())
    )

    rows = q.all()
    return rows
