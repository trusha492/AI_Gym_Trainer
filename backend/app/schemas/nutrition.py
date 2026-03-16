# app/schemas/nutrition.py
from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NutritionHistoryItem(BaseModel):
    id: int
    log_date: date
    calories_consumed: Optional[float] = None
    calories_target: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fats_g: Optional[float] = None
    weight_kg: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
