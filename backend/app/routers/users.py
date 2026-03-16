from datetime import date, timedelta
import json

from fastapi import APIRouter, Body, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.calorie_log import CalorieLog
from app.models.daily_checkin import DailyCheckin
from app.models.profile import Profile
from app.models.workout_log import WorkoutLog
from app.models.workout_session import WorkoutSession
from app.models.weekly_plan import WeeklyPlan
from app.models.user import User
from app.models.weight_log import WeightLog
from app.schemas.profile import ProfileOut

router = APIRouter(prefix="/user", tags=["User"])


class WeeklyPlanDay(BaseModel):
    day: str
    type: str
    details: str
    calories: float


class WeeklyPlanPayload(BaseModel):
    target_workouts: int = Field(ge=0, le=14)
    plan: list[WeeklyPlanDay]


class DailyCheckinPayload(BaseModel):
    trained: bool | None = None
    steps_band: str | None = None
    energy: str | None = None


class WorkoutSessionPayload(BaseModel):
    plan_day: str | None = None
    plan_type: str | None = None
    plan_details: str | None = None
    total_sets: int = Field(default=0, ge=0)
    completed_sets: int = Field(default=0, ge=0)
    completion_pct: float = Field(default=0.0, ge=0, le=100)
    done_map: dict[str, bool] = Field(default_factory=dict)


class InputHistoryPayload(BaseModel):
    log_date: date
    calories_consumed: float | None = None
    calories_target: float | None = None
    weight_kg: float | None = None


def _serialize_daily_checkin(row: DailyCheckin):
    return {
        "date": row.log_date.isoformat(),
        "trained": row.trained,
        "steps_band": row.steps_band,
        "energy": row.energy,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


def _serialize_workout_session(row: WorkoutSession):
    try:
        done_map = json.loads(row.done_map_json) if row.done_map_json else {}
    except json.JSONDecodeError:
        done_map = {}

    return {
        "date": row.log_date.isoformat(),
        "plan_day": row.plan_day,
        "plan_type": row.plan_type,
        "plan_details": row.plan_details,
        "total_sets": row.total_sets,
        "completed_sets": row.completed_sets,
        "completion_pct": row.completion_pct,
        "done_map": done_map,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "profile": profile,
    }


@router.post("/profile", response_model=ProfileOut)
async def update_profile(
    request: Request,
    data: dict | None = Body(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )
    if not profile:
        profile = Profile(user_id=current_user.id)

    payload = dict(data or {})
    if not payload:
        try:
            parsed = await request.json()
            if isinstance(parsed, dict):
                payload = dict(parsed)
        except Exception:
            payload = {}

    # Accept query params as fallback (Swagger/manual calls).
    for key, value in request.query_params.items():
        if key not in payload:
            payload[key] = value
    if "gendr" in payload and "gender" not in payload:
        payload["gender"] = payload.get("gendr")

    allowed_fields = {
        "age",
        "gender",
        "height_cm",
        "weight_kg",
        "goal",
        "activity_level",
        "allergies",
        "dietary_preference",
        "preferred_language",
    }

    def normalize_number(value, as_int=False):
        if value is None:
            return None
        if isinstance(value, str) and value.strip() == "":
            return None
        try:
            return int(value) if as_int else float(value)
        except (TypeError, ValueError):
            return None

    updates = {}
    for field in allowed_fields:
        if field not in payload:
            continue
        value = payload[field]
        if field == "age":
            updates[field] = normalize_number(value, as_int=True)
        elif field in {"height_cm", "weight_kg"}:
            updates[field] = normalize_number(value, as_int=False)
        else:
            if isinstance(value, str):
                value = value.strip()
            updates[field] = value if value != "" else None

    for field, value in updates.items():
        setattr(profile, field, value)

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "height_cm": profile.height_cm,
        "age": profile.age,
        "gender": profile.gender,
        "weight_kg": profile.weight_kg,
        "goal": profile.goal,
        "activity_level": profile.activity_level,
        "allergies": profile.allergies,
        "dietary_preference": profile.dietary_preference,
        "preferred_language": profile.preferred_language,
    }


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    latest_weight_row = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == current_user.id)
        .order_by(WeightLog.log_date.desc())
        .first()
    )
    latest_weight = latest_weight_row.weight_kg if latest_weight_row else None

    week_ago = today - timedelta(days=7)
    week_ago_weight_row = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == current_user.id,
            WeightLog.log_date <= week_ago,
        )
        .order_by(WeightLog.log_date.desc())
        .first()
    )
    weight_change_week = (
        latest_weight_row.weight_kg - week_ago_weight_row.weight_kg
        if latest_weight_row and week_ago_weight_row
        else None
    )

    profile = current_user.profile
    bmi = None
    if profile and profile.height_cm and latest_weight:
        h_m = profile.height_cm / 100.0
        bmi = round(latest_weight / (h_m * h_m), 1)

    today_cal = (
        db.query(CalorieLog)
        .filter(
            CalorieLog.user_id == current_user.id,
            CalorieLog.log_date == today,
        )
        .order_by(CalorieLog.log_date.desc(), CalorieLog.id.desc())
        .first()
    )

    workouts_this_week = (
        db.query(WorkoutLog)
        .filter(
            WorkoutLog.user_id == current_user.id,
            WorkoutLog.log_date >= week_start,
            WorkoutLog.log_date <= today,
        )
        .all()
    )
    workouts_this_week = sum(max(0, row.workouts_done) for row in workouts_this_week)

    weight_rows = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == current_user.id,
        )
        .order_by(WeightLog.log_date.asc())
        .all()
    )

    # Keep latest entry for each ISO week so chart has one point per week.
    weekly_latest = {}
    for row in weight_rows:
        year, week_no, _ = row.log_date.isocalendar()
        key = (year, week_no)
        week_monday = row.log_date - timedelta(days=row.log_date.weekday())
        weekly_latest[key] = {
            "week_label": week_monday.strftime("%b %d"),
            "weight": float(row.weight_kg),
        }

    weekly_progress = [weekly_latest[k] for k in sorted(weekly_latest.keys())][-6:]

    return {
        "current_weight": latest_weight,
        "weight_change_week": round(weight_change_week, 1) if weight_change_week is not None else None,
        "bmi": bmi,
        "calories_today": today_cal.calories_consumed if today_cal else None,
        "calories_target": today_cal.calories_target if today_cal else None,
        "workouts_this_week": workouts_this_week,
        "weekly_progress": weekly_progress,
    }


@router.get("/input-history")
def get_input_history(
    days: int = 60,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    clamped_days = min(max(days, 1), 365)
    since = date.today() - timedelta(days=clamped_days - 1)

    calorie_rows = (
        db.query(CalorieLog)
        .filter(
            CalorieLog.user_id == current_user.id,
            CalorieLog.log_date >= since,
        )
        .order_by(CalorieLog.log_date.desc(), CalorieLog.id.desc())
        .all()
    )
    weight_rows = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == current_user.id,
            WeightLog.log_date >= since,
        )
        .order_by(WeightLog.log_date.desc(), WeightLog.id.desc())
        .all()
    )

    by_date = {}
    for row in calorie_rows:
        key = row.log_date.isoformat()
        if key not in by_date:
            by_date[key] = {"log_date": key}
        by_date[key]["calories_consumed"] = row.calories_consumed
        by_date[key]["calories_target"] = row.calories_target

    for row in weight_rows:
        key = row.log_date.isoformat()
        if key not in by_date:
            by_date[key] = {"log_date": key}
        by_date[key]["weight_kg"] = row.weight_kg

    result = list(by_date.values())
    result.sort(key=lambda item: item["log_date"], reverse=True)
    return result


@router.post("/input-history")
def upsert_input_history(
    payload: InputHistoryPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if (
        payload.calories_consumed is None
        and payload.calories_target is None
        and payload.weight_kg is None
    ):
        return {"message": "No values provided."}

    if payload.calories_consumed is not None or payload.calories_target is not None:
        cal_row = (
            db.query(CalorieLog)
            .filter(
                CalorieLog.user_id == current_user.id,
                CalorieLog.log_date == payload.log_date,
            )
            .order_by(CalorieLog.id.desc())
            .first()
        )
        if not cal_row:
            # Compatibility fallback for legacy singleton unique index on user_id.
            cal_row = (
                db.query(CalorieLog)
                .filter(CalorieLog.user_id == current_user.id)
                .order_by(CalorieLog.log_date.desc(), CalorieLog.id.desc())
                .first()
            )
        if not cal_row:
            cal_row = CalorieLog(
                user_id=current_user.id,
                log_date=payload.log_date,
            )
            db.add(cal_row)
        else:
            cal_row.log_date = payload.log_date
        if payload.calories_consumed is not None:
            cal_row.calories_consumed = payload.calories_consumed
        if payload.calories_target is not None:
            cal_row.calories_target = payload.calories_target

    if payload.weight_kg is not None:
        weight_row = (
            db.query(WeightLog)
            .filter(
                WeightLog.user_id == current_user.id,
                WeightLog.log_date == payload.log_date,
            )
            .order_by(WeightLog.id.desc())
            .first()
        )
        if not weight_row:
            # Compatibility fallback for legacy singleton unique index on user_id.
            weight_row = (
                db.query(WeightLog)
                .filter(WeightLog.user_id == current_user.id)
                .order_by(WeightLog.log_date.desc(), WeightLog.id.desc())
                .first()
            )
        if not weight_row:
            weight_row = WeightLog(
                user_id=current_user.id,
                log_date=payload.log_date,
                weight_kg=payload.weight_kg,
            )
            db.add(weight_row)
        else:
            weight_row.log_date = payload.log_date
            weight_row.weight_kg = payload.weight_kg

    db.commit()
    return {"message": "Input history updated."}


@router.get("/weekly-plan")
def get_weekly_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = (
        db.query(WeeklyPlan)
        .filter(WeeklyPlan.user_id == current_user.id)
        .first()
    )
    if not row:
        return {"target_workouts": None, "plan": None, "updated_at": None}

    try:
        plan = json.loads(row.plan_json)
    except json.JSONDecodeError:
        plan = []

    return {
        "target_workouts": row.target_workouts,
        "plan": plan,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


@router.post("/weekly-plan")
def save_weekly_plan(
    payload: WeeklyPlanPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = (
        db.query(WeeklyPlan)
        .filter(WeeklyPlan.user_id == current_user.id)
        .first()
    )
    plan_json = json.dumps([item.model_dump() for item in payload.plan])

    if not row:
        row = WeeklyPlan(
            user_id=current_user.id,
            target_workouts=payload.target_workouts,
            plan_json=plan_json,
        )
    else:
        row.target_workouts = payload.target_workouts
        row.plan_json = plan_json

    db.add(row)
    db.commit()
    db.refresh(row)

    return {
        "message": "Weekly plan saved",
        "target_workouts": row.target_workouts,
        "plan": payload.plan,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


@router.get("/daily-checkin/today")
def get_today_daily_checkin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    row = (
        db.query(DailyCheckin)
        .filter(
            DailyCheckin.user_id == current_user.id,
            DailyCheckin.log_date == today,
        )
        .first()
    )
    return _serialize_daily_checkin(row) if row else None


@router.post("/daily-checkin/today")
def upsert_today_daily_checkin(
    payload: DailyCheckinPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    row = (
        db.query(DailyCheckin)
        .filter(
            DailyCheckin.user_id == current_user.id,
            DailyCheckin.log_date == today,
        )
        .first()
    )

    if not row:
        row = DailyCheckin(
            user_id=current_user.id,
            log_date=today,
        )

    if payload.trained is not None:
        row.trained = payload.trained
    if payload.steps_band is not None:
        row.steps_band = payload.steps_band
    if payload.energy is not None:
        row.energy = payload.energy

    db.add(row)
    db.commit()
    db.refresh(row)

    return _serialize_daily_checkin(row)


@router.get("/daily-checkins")
def get_recent_daily_checkins(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    clamped_days = min(max(days, 1), 60)
    since = date.today() - timedelta(days=clamped_days - 1)

    rows = (
        db.query(DailyCheckin)
        .filter(
            DailyCheckin.user_id == current_user.id,
            DailyCheckin.log_date >= since,
        )
        .order_by(DailyCheckin.log_date.desc())
        .all()
    )
    return [_serialize_daily_checkin(row) for row in rows]


@router.get("/workout-session/today")
def get_today_workout_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    row = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.log_date == today,
        )
        .first()
    )
    return _serialize_workout_session(row) if row else None


@router.post("/workout-session/today")
def upsert_today_workout_session(
    payload: WorkoutSessionPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    row = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.log_date == today,
        )
        .first()
    )

    if not row:
        row = WorkoutSession(
            user_id=current_user.id,
            log_date=today,
        )

    row.plan_day = payload.plan_day
    row.plan_type = payload.plan_type
    row.plan_details = payload.plan_details
    row.total_sets = payload.total_sets
    row.completed_sets = payload.completed_sets
    row.completion_pct = payload.completion_pct
    row.done_map_json = json.dumps(payload.done_map)

    db.add(row)
    db.commit()
    db.refresh(row)

    return _serialize_workout_session(row)
