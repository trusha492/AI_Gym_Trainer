from datetime import date
from sqlalchemy.orm import Session
from app.models.calorie_log import CalorieLog
from app.models.profile import Profile
from app.models.weight_log import WeightLog

def save_calorie_log(
    db: Session,
    user_id: int,
    calories_consumed: float,
    calories_target: float | None = None,
    protein_g: float | None = None,
    carbs_g: float | None = None,
    fats_g: float | None = None,
    log_date: date | None = None,
):
    resolved_date = log_date or date.today()
    log = (
        db.query(CalorieLog)
        .filter(
            CalorieLog.user_id == user_id,
            CalorieLog.log_date == resolved_date,
        )
        .order_by(CalorieLog.id.desc())
        .first()
    )

    # Compatibility fallback: if old singleton unique index still exists,
    # there can be only one row per user. Reuse that row instead of inserting.
    if not log:
        log = (
            db.query(CalorieLog)
            .filter(CalorieLog.user_id == user_id)
            .order_by(CalorieLog.log_date.desc(), CalorieLog.id.desc())
            .first()
        )

    if not log:
        log = CalorieLog(
            user_id=user_id,
            log_date=resolved_date,
        )
        db.add(log)

    log.calories_consumed = calories_consumed
    log.calories_target = calories_target
    log.protein_g = protein_g
    log.carbs_g = carbs_g
    log.fats_g = fats_g

    db.commit()
    db.refresh(log)
    return log

def save_weight_log(
    db: Session,
    user_id: int,
    weight_kg: float,
    log_date: date | None = None,
):
    resolved_date = log_date or date.today()
    log = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == user_id,
            WeightLog.log_date == resolved_date,
        )
        .order_by(WeightLog.id.desc())
        .first()
    )

    # Compatibility fallback: if old singleton unique index still exists,
    # there can be only one row per user. Reuse that row instead of inserting.
    if not log:
        log = (
            db.query(WeightLog)
            .filter(WeightLog.user_id == user_id)
            .order_by(WeightLog.log_date.desc(), WeightLog.id.desc())
            .first()
        )

    if not log:
        log = WeightLog(
            user_id=user_id,
            log_date=resolved_date,
            weight_kg=weight_kg,
        )
        db.add(log)
    else:
        log.weight_kg = weight_kg

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)
    profile.weight_kg = weight_kg

    db.commit()
    db.refresh(log)
    return log
