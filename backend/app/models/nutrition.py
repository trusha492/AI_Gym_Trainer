from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base


class NutritionEntry(Base):
    __tablename__ = "nutrition_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    ai_advice = Column(Text, nullable=False)
    image_path = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # must match User.nutrition_entries
    user = relationship("User", back_populates="nutrition_entries")
