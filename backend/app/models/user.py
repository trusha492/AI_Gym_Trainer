from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)  # <- add this

    weight_logs = relationship(
        "WeightLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    nutrition_entries = relationship(
        "NutritionEntry",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    calorie_logs = relationship(
        "CalorieLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    workout_logs = relationship(
        "WorkoutLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    profile = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    chat_messages = relationship(
        "ChatHistory",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    weekly_plan = relationship(
        "WeeklyPlan",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    daily_checkins = relationship(
        "DailyCheckin",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    workout_sessions = relationship(
        "WorkoutSession",
        back_populates="user",
        cascade="all, delete-orphan",
    )
