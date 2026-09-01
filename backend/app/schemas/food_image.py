from pydantic import BaseModel


class FoodImageResponse(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    width: int
    height: int
    status: str
    message: str