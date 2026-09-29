from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class MealItemInput(BaseModel):
    barcode: str | None = None
    detection_key: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=120)
    grams: float = Field(gt=0, le=10000)
    calories_per_100g: float | None = Field(default=None, ge=0, le=1000)
    protein_per_100g: float | None = Field(default=None, ge=0, le=100)
    carbs_per_100g: float | None = Field(default=None, ge=0, le=100)
    fat_per_100g: float | None = Field(default=None, ge=0, le=100)

    @model_validator(mode="after")
    def check_nutrition(self):
        if self.barcode or self.detection_key:
            return self
        if not self.name or any(
            value is None for value in (
                self.calories_per_100g, self.protein_per_100g,
                self.carbs_per_100g, self.fat_per_100g,
            )
        ):
            raise ValueError("Cada alimento necesita un código de barras o datos nutricionales completos.")
        return self


class MealEntryCreate(BaseModel):
    recorded_on: date
    meal_type: Literal["desayuno", "almuerzo", "cena", "snack"]
    source: Literal["manual", "barcode", "photo"]
    items: list[MealItemInput] = Field(min_length=1, max_length=20)


class MealEntryResponse(BaseModel):
    id: int
    recorded_on: date
    meal_type: str
    source: str
    description: str
    calories: int
    protein_grams: float
    carb_grams: float
    fat_grams: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DailySummaryResponse(BaseModel):
    date: date
    consumed_calories: int
    consumed_protein: float
    consumed_carbs: float
    consumed_fat: float
    goal_calories: int
    goal_protein: int
    goal_carbs: int
    goal_fat: int
    meals: list[MealEntryResponse]
