# app/models/profile.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Basic info
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)           # "male", "female", etc.
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)

    # Fitness goal (used by chatbot)
    goal = Column(String(50), nullable=True)             # "fat loss", "muscle gain", etc.
    activity_level = Column(String(50), nullable=True)   # "sedentary", "moderate", "active"

    # Optional extra fields
    allergies = Column(String(255), nullable=True)
    dietary_preference = Column(String(50), nullable=True)  # "veg", "non-veg", etc.
    preferred_language = Column(String(10), nullable=True)  # "en", "hi", "mr"

    user = relationship("User", back_populates="profile")
