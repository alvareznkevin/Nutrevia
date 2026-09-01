from enum import Enum

from pydantic import BaseModel, ConfigDict


class GoalType(str, Enum):
    lose = "lose"
    maintain = "maintain"
    gain = "gain"


class NutritionGoalRequest(BaseModel):
    goal_type: GoalType


class NutritionGoalResponse(BaseModel):
    id: int
    user_id: int
    goal_type: GoalType
    daily_calories: int
    protein_grams: int
    carbohydrate_grams: int
    fat_grams: int

    model_config = ConfigDict(from_attributes=True)