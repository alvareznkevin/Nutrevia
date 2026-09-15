from pydantic import BaseModel


class FoodBoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float


class DetectedFood(BaseModel):
    key: str
    name: str
    confidence: float
    bounding_box: FoodBoundingBox


class FoodImageResponse(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    width: int
    height: int
    status: str
    message: str
    model: str
    detections: list[DetectedFood]
