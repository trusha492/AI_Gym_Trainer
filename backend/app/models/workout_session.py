from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.base import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    __table_args__ = (UniqueConstraint("user_id", "log_date", name="uq_workout_session_user_date"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    log_date = Column(Date, default=date.today, nullable=False, index=True)
    plan_day = Column(String(10), nullable=True)
    plan_type = Column(String(30), nullable=True)
    plan_details = Column(Text, nullable=True)
    total_sets = Column(Integer, nullable=False, default=0)
    completed_sets = Column(Integer, nullable=False, default=0)
    completion_pct = Column(Float, nullable=False, default=0.0)
    done_map_json = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="workout_sessions")

