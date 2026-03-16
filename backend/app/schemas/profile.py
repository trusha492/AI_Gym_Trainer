# app/schemas/profile.py
from pydantic import BaseModel
from typing import Optional

class ProfileUpdateSchema(BaseModel):
    height_cm: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None
    allergies: Optional[str] = None
    dietary_preference: Optional[str] = None
    preferred_language: Optional[str] = None

class ProfileOut(BaseModel):
    id: int
    user_id: int
    height_cm: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None
    allergies: Optional[str] = None
    dietary_preference: Optional[str] = None
    preferred_language: Optional[str] = None

    class Config:
        from_attributes = True  # Pydantic v2 (from_orm=True in v1)
