from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.nutrition_goal import NutritionGoal
from app.models.profile import Profile
from app.models.user import User
from app.schemas.nutrition_goal import (
    NutritionGoalRequest,
    NutritionGoalResponse,
)
from app.services.nutrition import calculate_nutrition_goal


router = APIRouter(
    prefix="/nutrition-goal",
    tags=["Nutrition Goal"],
)

DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.put(
    "/me",
    response_model=NutritionGoalResponse,
)
def save_my_nutrition_goal(
    data: NutritionGoalRequest,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> NutritionGoal:
    profile = database.scalar(
        select(Profile).where(Profile.user_id == current_user.id)
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes completar tu perfil antes de calcular el objetivo.",
        )

    if profile.calculation_sex is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El perfil no tiene todos los datos necesarios.",
        )

    calculation = calculate_nutrition_goal(
        age=profile.age,
        height_cm=float(profile.height_cm),
        weight_kg=float(profile.current_weight_kg),
        activity_level=profile.activity_level,
        calculation_sex=profile.calculation_sex,
        goal_type=data.goal_type.value,
    )

    nutrition_goal = database.scalar(
        select(NutritionGoal).where(
            NutritionGoal.user_id == current_user.id
        )
    )

    if nutrition_goal is None:
        nutrition_goal = NutritionGoal(
            user_id=current_user.id,
            goal_type=data.goal_type.value,
            daily_calories=calculation.calories,
            protein_grams=calculation.protein_grams,
            carbohydrate_grams=calculation.carbohydrate_grams,
            fat_grams=calculation.fat_grams,
        )
        database.add(nutrition_goal)
    else:
        nutrition_goal.goal_type = data.goal_type.value
        nutrition_goal.daily_calories = calculation.calories
        nutrition_goal.protein_grams = calculation.protein_grams
        nutrition_goal.carbohydrate_grams = calculation.carbohydrate_grams
        nutrition_goal.fat_grams = calculation.fat_grams

    database.commit()
    database.refresh(nutrition_goal)

    return nutrition_goal

@router.get(
    "/me",
    response_model=NutritionGoalResponse,
)
def get_my_nutrition_goal(
    current_user: CurrentUser,
    database: DatabaseSession,
) -> NutritionGoal:
    nutrition_goal = database.scalar(
        select(NutritionGoal).where(
            NutritionGoal.user_id == current_user.id
        )
    )

    if nutrition_goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario todavía no tiene un objetivo nutricional.",
        )

    return nutrition_goal