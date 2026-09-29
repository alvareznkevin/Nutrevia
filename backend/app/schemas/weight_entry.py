from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class WeightEntryCreate(BaseModel):
    recorded_on: date
    weight_kg: float = Field(ge=20, le=400)


class WeightEntryResponse(BaseModel):
    id: int
    recorded_on: date
    weight_kg: float

    model_config = ConfigDict(from_attributes=True)