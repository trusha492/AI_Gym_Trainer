from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.users import router as users_router
from app.routers.nutrition import router as nutrition_router
from app.routers.admin import router as admin_router
from app.routers.stats import router as stats_router

from sqlalchemy import inspect, text

from app.database.session import engine, SessionLocal
from app.database.base import Base

# Import models so tables are registered
from app.models.user import User
from app.models.weight_log import WeightLog
from app.models.nutrition import NutritionEntry
from app.models.calorie_log import CalorieLog
from app.models.workout_log import WorkoutLog
from app.models.weekly_plan import WeeklyPlan
from app.models.profile import Profile
from app.models.chat_history import ChatHistory
from app.models.daily_checkin import DailyCheckin
from app.models.workout_session import WorkoutSession

Base.metadata.create_all(bind=engine)


def _dedupe_single_row_logs():
    db = SessionLocal()
    try:
        for model in (WeightLog, CalorieLog):
            rows = (
                db.query(model)
                .order_by(model.user_id.asc(), model.log_date.desc(), model.id.desc())
                .all()
            )
            seen_keys = set()
            for row in rows:
                key = (row.user_id, row.log_date)
                if key in seen_keys:
                    db.delete(row)
                else:
                    seen_keys.add(key)
        db.commit()
    except Exception as exc:
        db.rollback()
        print(f"[startup] Failed to dedupe singleton logs: {exc}")
    finally:
        db.close()


def _ensure_singleton_indexes():
    conn = engine.connect()
    trans = conn.begin()
    try:
        inspector = inspect(conn)
        weight_indexes = {idx["name"] for idx in inspector.get_indexes("weight_logs")}
        calorie_indexes = {idx["name"] for idx in inspector.get_indexes("calorie_logs")}

        # Drop obsolete singleton indexes only when present (MySQL-safe).
        if "uq_weight_logs_user_id" in weight_indexes:
            conn.execute(text("DROP INDEX uq_weight_logs_user_id ON weight_logs"))
            weight_indexes.remove("uq_weight_logs_user_id")

        if "uq_calorie_logs_user_id" in calorie_indexes:
            conn.execute(text("DROP INDEX uq_calorie_logs_user_id ON calorie_logs"))
            calorie_indexes.remove("uq_calorie_logs_user_id")

        if "uq_weight_logs_user_date" not in weight_indexes:
            conn.execute(text("CREATE UNIQUE INDEX uq_weight_logs_user_date ON weight_logs (user_id, log_date)"))
        if "uq_calorie_logs_user_date" not in calorie_indexes:
            conn.execute(text("CREATE UNIQUE INDEX uq_calorie_logs_user_date ON calorie_logs (user_id, log_date)"))

        trans.commit()
    except Exception as exc:
        trans.rollback()
        print(f"[startup] Failed to ensure singleton indexes: {exc}")
    finally:
        conn.close()


def _ensure_profile_language_column():
    conn = engine.connect()
    trans = conn.begin()
    try:
        inspector = inspect(conn)
        columns = {col["name"] for col in inspector.get_columns("profiles")}
        if "preferred_language" not in columns:
            conn.execute(text("ALTER TABLE profiles ADD COLUMN preferred_language VARCHAR(10) NULL"))
        trans.commit()
    except Exception as exc:
        trans.rollback()
        print(f"[startup] Failed to ensure profile language column: {exc}")
    finally:
        conn.close()


_dedupe_single_row_logs()
_ensure_singleton_indexes()
_ensure_profile_language_column()

app = FastAPI(
    title="AI Gym Trainer API",
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
)

uploads_dir = Path(__file__).resolve().parents[1] / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # or ["*"] during local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
# Final paths:
#   /api/auth/register
#   /api/auth/login
#   /api/auth/logout
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])

# e.g. /api/chat/...
app.include_router(chat_router, prefix="/api", tags=["Chatbot"])

# users.py has prefix="/user" -> /api/user/profile, /api/user/dashboard, etc.
app.include_router(users_router, prefix="/api", tags=["User"])

# nutrition routes under /api/...
app.include_router(nutrition_router, prefix="/api", tags=["Nutrition"])

# admin under /api/admin/...
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

# stats under /api/...
app.include_router(stats_router, prefix="/api", tags=["Stats"])


@app.get("/")
def root():
    return {"status": "AI Gym Trainer backend running"}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="AI Gym Trainer API",
        version="1.0.0",
        description="API with JWT Authentication",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    openapi_schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
