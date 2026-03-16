# app/models/calorie_log.py
from datetime import date
from sqlalchemy import Column, Integer, Float, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.base import Base

class CalorieLog(Base):
    __tablename__ = "calorie_logs"
    __table_args__ = (UniqueConstraint("user_id", "log_date", name="uq_calorie_logs_user_date"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Which day this log is for
    log_date = Column(Date, default=date.today, index=True)

    # Total calories consumed that day
    calories_consumed = Column(Float, default=0.0)

    # Target calories for that day (from profile/goal)
    calories_target = Column(Float, nullable=True)

    # Optional macro totals
    protein_g = Column(Float, nullable=True)
    carbs_g = Column(Float, nullable=True)
    fats_g = Column(Float, nullable=True)

    user = relationship("User", back_populates="calorie_logs")
