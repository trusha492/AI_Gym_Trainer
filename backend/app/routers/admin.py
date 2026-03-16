from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.chat_history import ChatHistory
from app.models.calorie_log import CalorieLog
from app.models.nutrition import NutritionEntry
from app.models.user import User
from app.models.weight_log import WeightLog
from app.models.workout_log import WorkoutLog

router = APIRouter()


class AdminUserUpdate(BaseModel):
    name: str
    email: EmailStr
    is_admin: bool | None = None

def require_admin(current_user: User = Depends(get_current_user)):
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins only",
        )
    return current_user


@router.get("/overview", dependencies=[Depends(require_admin)])
def admin_overview(db: Session = Depends(get_db)):
    total_users = db.query(User).filter(User.is_admin == False).count()
    total_weight_logs = db.query(WeightLog).count()
    total_nutrition_entries = db.query(NutritionEntry).count()
    return {
        "total_users": total_users,
        "total_weight_logs": total_weight_logs,
        "total_nutrition_entries": total_nutrition_entries,
    }


@router.get("/users", dependencies=[Depends(require_admin)])
def admin_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.put("/users/{user_id}")
def admin_update_user(
    user_id: int,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    duplicate = (
        db.query(User)
        .filter(User.email == payload.email, User.id != user_id)
        .first()
    )
    if duplicate:
        raise HTTPException(status_code=400, detail="Email already in use")

    user.name = payload.name
    user.email = payload.email

    # Optional admin toggle, but block self-demotion.
    if payload.is_admin is not None:
        if current_user.id == user_id and payload.is_admin is False:
            raise HTTPException(status_code=400, detail="Cannot remove your own admin role")
        user.is_admin = payload.is_admin

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.get("/analytics", dependencies=[Depends(require_admin)])
def admin_analytics(db: Session = Depends(get_db)):
    today = date.today()
    seven_days_ago = today - timedelta(days=6)
    prev_week_start = today - timedelta(days=13)
    prev_week_end = today - timedelta(days=7)

    def activity_user_ids(start_date: date, end_date: date) -> set[int]:
        start_dt = datetime.combine(start_date, time.min)
        end_dt = datetime.combine(end_date + timedelta(days=1), time.min)

        ids = set()
        ids.update(
            user_id for (user_id,) in db.query(ChatHistory.user_id).filter(
                ChatHistory.created_at >= start_dt,
                ChatHistory.created_at < end_dt,
            ).distinct()
        )
        ids.update(
            user_id for (user_id,) in db.query(NutritionEntry.user_id).filter(
                NutritionEntry.created_at >= start_dt,
                NutritionEntry.created_at < end_dt,
            ).distinct()
        )
        ids.update(
            user_id for (user_id,) in db.query(WeightLog.user_id).filter(
                WeightLog.log_date >= start_date,
                WeightLog.log_date <= end_date,
            ).distinct()
        )
        ids.update(
            user_id for (user_id,) in db.query(CalorieLog.user_id).filter(
                CalorieLog.log_date >= start_date,
                CalorieLog.log_date <= end_date,
            ).distinct()
        )
        ids.update(
            user_id for (user_id,) in db.query(WorkoutLog.user_id).filter(
                WorkoutLog.log_date >= start_date,
                WorkoutLog.log_date <= end_date,
            ).distinct()
        )
        return ids

    active_this_week = activity_user_ids(seven_days_ago, today)
    active_prev_week = activity_user_ids(prev_week_start, prev_week_end)
    retained_users = active_this_week.intersection(active_prev_week)

    total_users = db.query(User).count()
    active_users_7d = len(active_this_week)
    inactive_users_7d = max(0, total_users - active_users_7d)
    retained_users_7d = len(retained_users)
    retention_rate_7d = (
        round((retained_users_7d / len(active_prev_week)) * 100, 1)
        if len(active_prev_week) > 0
        else 0.0
    )

    # Usage timeline for the last 7 days.
    labels = []
    chat_messages_7d = []
    nutrition_entries_7d = []
    weight_logs_7d = []
    workouts_logged_7d = []

    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        next_day = day + timedelta(days=1)
        labels.append(day.strftime("%b %d"))

        day_chat = db.query(ChatHistory).filter(
            ChatHistory.created_at >= datetime.combine(day, time.min),
            ChatHistory.created_at < datetime.combine(next_day, time.min),
        ).count()
        day_nutrition = db.query(NutritionEntry).filter(
            NutritionEntry.created_at >= datetime.combine(day, time.min),
            NutritionEntry.created_at < datetime.combine(next_day, time.min),
        ).count()
        day_weight = db.query(WeightLog).filter(WeightLog.log_date == day).count()
        day_workout_rows = db.query(WorkoutLog).filter(WorkoutLog.log_date == day).all()
        day_workouts = sum(max(0, row.workouts_done) for row in day_workout_rows)

        chat_messages_7d.append(day_chat)
        nutrition_entries_7d.append(day_nutrition)
        weight_logs_7d.append(day_weight)
        workouts_logged_7d.append(day_workouts)

    total_chat_messages_7d = sum(chat_messages_7d)
    total_nutrition_entries_7d = sum(nutrition_entries_7d)

    return {
        "weight_log_count": db.query(WeightLog).count(),
        "nutrition_entry_count": db.query(NutritionEntry).count(),
        "total_users": total_users,
        "active_users_7d": active_users_7d,
        "inactive_users_7d": inactive_users_7d,
        "retained_users_7d": retained_users_7d,
        "retention_rate_7d": retention_rate_7d,
        "total_chat_messages_7d": total_chat_messages_7d,
        "total_nutrition_entries_7d": total_nutrition_entries_7d,
        "labels": labels,
        "chat_messages_7d": chat_messages_7d,
        "nutrition_entries_7d_timeline": nutrition_entries_7d,
        "weight_logs_7d": weight_logs_7d,
        "workouts_logged_7d": workouts_logged_7d,
    }
