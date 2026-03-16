from datetime import date

from sqlalchemy import Column, Date, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database.base import Base


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    log_date = Column(Date, default=date.today, index=True)
    workouts_done = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="workout_logs")
