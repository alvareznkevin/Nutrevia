from io import BytesIO
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from PIL import Image, UnidentifiedImageError

from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.food_image import FoodImageResponse


router = APIRouter(
    prefix="/food-images",
    tags=["Food Images"],
)

CurrentUser = Annotated[User, Depends(get_current_user)]

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

ALLOWED_IMAGE_FORMATS = {
    "JPEG",
    "PNG",
    "WEBP",
}


@router.post(
    "/analyze",
    response_model=FoodImageResponse,
)
async def analyze_food_image(
    current_user: CurrentUser,
    file: Annotated[
        UploadFile,
        File(description="Fotografía de la comida"),
    ],
) -> FoodImageResponse:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="La imagen debe ser JPG, PNG o WebP.",
        )

    contents = await file.read(MAX_IMAGE_SIZE_BYTES + 1)
    await file.close()

    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La imagen está vacía.",
        )

    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="La imagen no puede superar los 10 MB.",
        )

    try:
        with Image.open(BytesIO(contents)) as image:
            detected_format = image.format
            image.verify()

        with Image.open(BytesIO(contents)) as image:
            width, height = image.size
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo recibido no es una imagen válida.",
        )

    if detected_format not in ALLOWED_IMAGE_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="El formato real de la imagen no está permitido.",
        )

    return FoodImageResponse(
        filename=file.filename or "food-image",
        content_type=file.content_type,
        size_bytes=len(contents),
        width=width,
        height=height,
        status="received",
        message=(
            "La imagen fue recibida correctamente y está preparada "
            "para su análisis futuro."
        ),
    )