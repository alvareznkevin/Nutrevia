from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ActivityLevel(str, Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    very_active = "very_active"


class CalculationSex(str, Enum):
    male = "male"
    female = "female"


class ProfileCreate(BaseModel):
    age: int = Field(ge=18, le=120)
    height_cm: float = Field(ge=80, le=250)
    current_weight_kg: float = Field(ge=20, le=400)
    activity_level: ActivityLevel
    calculation_sex: CalculationSex


class ProfileUpdate(BaseModel):
    age: int | None = Field(default=None, ge=18, le=120)
    height_cm: float | None = Field(default=None, ge=80, le=250)
    current_weight_kg: float | None = Field(default=None, ge=20, le=400)
    activity_level: ActivityLevel | None = None
    calculation_sex: CalculationSex | None = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    age: int
    height_cm: float
    current_weight_kg: float
    activity_level: ActivityLevel
    calculation_sex: CalculationSex | None

    model_config = ConfigDict(from_attributes=True)