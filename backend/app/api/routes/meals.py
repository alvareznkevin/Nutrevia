from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.api.routes.barcode import get_food_by_barcode
from app.db.session import get_db
from app.models.meal_entry import MealEntry
from app.models.nutrition_goal import NutritionGoal
from app.models.user import User
from app.schemas.meal_entry import DailySummaryResponse, MealEntryCreate, MealEntryResponse

router = APIRouter(prefix="/meals", tags=["Meals"])
DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

DETECTION_NUTRITION = {
    "rice": (130, 2.4, 28, 0.3),
    "pasta": (158, 5.8, 30.9, 0.9),
    "chicken": (165, 31, 0, 3.6),
    "potato": (87, 1.9, 20.1, 0.1),
    "tomato": (18, 0.9, 3.9, 0.2),
    "egg": (155, 13, 1.1, 11),
}


@router.post("", response_model=MealEntryResponse, status_code=status.HTTP_201_CREATED)
def create_meal(data: MealEntryCreate, current_user: CurrentUser, database: DatabaseSession):
    names: list[str] = []
    calories = protein = carbs = fat = 0.0

    for item in data.items:
        if item.barcode:
            product = get_food_by_barcode(item.barcode)
            name = product["name"]
            kcal_100g = float(product["calories_per_100g"])
            protein_100g = float(product["protein_per_100g"])
            carbs_100g = float(product["carbs_per_100g"])
            fat_100g = float(product["fat_per_100g"])
        elif item.detection_key:
            nutrition = DETECTION_NUTRITION.get(item.detection_key)
            if nutrition is None or not item.name:
                raise HTTPException(status_code=422, detail="Alimento detectado no reconocido.")
            name = item.name
            kcal_100g, protein_100g, carbs_100g, fat_100g = nutrition
        else:
            name = item.name
            kcal_100g = item.calories_per_100g
            protein_100g = item.protein_per_100g
            carbs_100g = item.carbs_per_100g
            fat_100g = item.fat_per_100g

        factor = item.grams / 100
        names.append(f"{name} ({item.grams:g} g)")
        calories += kcal_100g * factor
        protein += protein_100g * factor
        carbs += carbs_100g * factor
        fat += fat_100g * factor

    entry = MealEntry(
        user_id=current_user.id,
        recorded_on=data.recorded_on,
        meal_type=data.meal_type,
        source=data.source,
        description=", ".join(names)[:500],
        calories=round(calories),
        protein_grams=round(protein, 1),
        carb_grams=round(carbs, 1),
        fat_grams=round(fat, 1),
    )
    database.add(entry)
    database.commit()
    database.refresh(entry)
    return entry


@router.get("/summary", response_model=DailySummaryResponse)
def get_daily_summary(
    current_user: CurrentUser,
    database: DatabaseSession,
    recorded_on: date = Query(alias="date"),
):
    goal = database.scalar(select(NutritionGoal).where(NutritionGoal.user_id == current_user.id))
    if goal is None:
        raise HTTPException(status_code=404, detail="No hay un objetivo nutricional configurado.")

    entries = list(database.scalars(
        select(MealEntry)
        .where(MealEntry.user_id == current_user.id, MealEntry.recorded_on == recorded_on)
        .order_by(MealEntry.created_at, MealEntry.id)
    ))
    return DailySummaryResponse(
        date=recorded_on,
        consumed_calories=sum(entry.calories for entry in entries),
        consumed_protein=round(sum(float(entry.protein_grams) for entry in entries), 1),
        consumed_carbs=round(sum(float(entry.carb_grams) for entry in entries), 1),
        consumed_fat=round(sum(float(entry.fat_grams) for entry in entries), 1),
        goal_calories=goal.daily_calories,
        goal_protein=goal.protein_grams,
        goal_carbs=goal.carbohydrate_grams,
        goal_fat=goal.fat_grams,
        meals=entries,
    )


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(entry_id: int, current_user: CurrentUser, database: DatabaseSession):
    entry = database.scalar(select(MealEntry).where(
        MealEntry.id == entry_id, MealEntry.user_id == current_user.id,
    ))
    if entry is None:
        raise HTTPException(status_code=404, detail="Comida no encontrada.")
    database.delete(entry)
    database.commit()
