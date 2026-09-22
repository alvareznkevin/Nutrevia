import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/foods", tags=["Foods"])


@router.get("/barcode/{code}")
def get_food_by_barcode(code: str):
    if not code.isdigit() or not 8 <= len(code) <= 14:
        raise HTTPException(status_code=400, detail="Código de barras inválido.")

    url = f"https://world.openfoodfacts.org/api/v2/product/{code}.json"
    request = Request(
        url,
        headers={"User-Agent": "Nutrevia/0.1 (https://github.com/alvareznkevin/Nutrevia)"},
    )

    try:
        with urlopen(request, timeout=8) as response:
            data = json.load(response)
    except (HTTPError, URLError, TimeoutError):
        raise HTTPException(status_code=503, detail="No se pudo consultar Open Food Facts.")

    if data.get("status") != 1:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    product = data["product"]
    nutrients = product.get("nutriments", {})
    required = (
        "energy-kcal_100g",
        "proteins_100g",
        "carbohydrates_100g",
        "fat_100g",
    )

    if any(nutrients.get(field) is None for field in required):
        raise HTTPException(status_code=422, detail="El producto no tiene datos nutricionales completos.")

    return {
        "barcode": code,
        "name": product.get("product_name") or "Producto sin nombre",
        "brand": product.get("brands") or "",
        "calories_per_100g": nutrients["energy-kcal_100g"],
        "protein_per_100g": nutrients["proteins_100g"],
        "carbs_per_100g": nutrients["carbohydrates_100g"],
        "fat_per_100g": nutrients["fat_100g"],
    }