from functools import lru_cache
import logging
from threading import Lock

from PIL import Image

from app.core.config import settings
from app.schemas.food_image import DetectedFood, FoodBoundingBox


logger = logging.getLogger(__name__)


# YOLO-World suele responder mejor a conceptos escritos en inglés. La clave y el
# nombre en español mantienen estable el contrato que utiliza la aplicación.
FOOD_CLASSES = (
    ("cooked white rice", "rice", "Arroz"),
    ("steamed rice", "rice", "Arroz"),
    ("cooked pasta", "pasta", "Fideos"),
    ("spaghetti noodles", "pasta", "Fideos"),
    ("macaroni pasta", "pasta", "Fideos"),
    ("cooked chicken breast", "chicken", "Pollo"),
    ("grilled chicken breast", "chicken", "Pollo"),
    ("cooked potato", "potato", "Papa"),
    ("tomato", "tomato", "Tomate"),
    ("fried egg", "egg", "Huevo"),
    ("boiled egg", "egg", "Huevo"),
)


class FoodDetectionUnavailableError(RuntimeError):
    """El modelo no pudo cargarse o descargar sus pesos."""


class FoodDetector:
    def __init__(self) -> None:
        try:
            from ultralytics import YOLOWorld

            self.model = YOLOWorld(settings.food_detection_model)
            self.prompts = [prompt for prompt, _, _ in FOOD_CLASSES]
            self.model.set_classes(self.prompts)
            self._prediction_lock = Lock()
        except Exception as error:
            logger.exception("No fue posible iniciar YOLO-World")
            raise FoodDetectionUnavailableError(
                "No fue posible iniciar el modelo de detección de alimentos."
            ) from error

    def detect(self, image: Image.Image) -> list[DetectedFood]:
        try:
            with self._prediction_lock:
                results = self.model.predict(
                    source=image,
                    conf=settings.food_detection_confidence,
                    imgsz=settings.food_detection_image_size,
                    max_det=10,
                    verbose=False,
                )
        except Exception as error:
            logger.exception("YOLO-World no pudo analizar la fotografía")
            raise FoodDetectionUnavailableError(
                "No fue posible analizar la fotografía en este momento."
            ) from error

        if not results:
            return []

        result = results[0]
        if result.boxes is None:
            return []

        best_detection_by_food: dict[str, DetectedFood] = {}

        for box in result.boxes:
            class_id = int(box.cls.item())
            confidence = float(box.conf.item())
            coordinates = box.xyxy[0].tolist()

            if class_id < 0 or class_id >= len(FOOD_CLASSES):
                continue

            _, key, spanish_name = FOOD_CLASSES[class_id]

            detection = DetectedFood(
                key=key,
                name=spanish_name,
                confidence=round(confidence, 4),
                bounding_box=FoodBoundingBox(
                    x_min=round(float(coordinates[0]), 2),
                    y_min=round(float(coordinates[1]), 2),
                    x_max=round(float(coordinates[2]), 2),
                    y_max=round(float(coordinates[3]), 2),
                ),
            )

            current_best = best_detection_by_food.get(key)
            if (
                current_best is None
                or detection.confidence > current_best.confidence
            ):
                best_detection_by_food[key] = detection

        return sorted(
            best_detection_by_food.values(),
            key=lambda detection: detection.confidence,
            reverse=True,
        )


@lru_cache(maxsize=1)
def get_food_detector() -> FoodDetector:
    return FoodDetector()


def detect_foods(image: Image.Image) -> list[DetectedFood]:
    return get_food_detector().detect(image)
