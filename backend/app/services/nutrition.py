from dataclasses import dataclass


ACTIVITY_FACTORS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

GOAL_ADJUSTMENTS = {
    "lose": -300,
    "maintain": 0,
    "gain": 300,
}


@dataclass
class NutritionCalculation:
    calories: int
    protein_grams: int
    carbohydrate_grams: int
    fat_grams: int


def calculate_nutrition_goal(
    *,
    age: int,
    height_cm: float,
    weight_kg: float,
    activity_level: str,
    calculation_sex: str,
    goal_type: str,
) -> NutritionCalculation:
    if calculation_sex == "male":
        resting_calories = (
            10 * weight_kg
            + 6.25 * height_cm
            - 5 * age
            + 5
        )
    elif calculation_sex == "female":
        resting_calories = (
            10 * weight_kg
            + 6.25 * height_cm
            - 5 * age
            - 161
        )
    else:
        raise ValueError("Invalid calculation sex")

    activity_factor = ACTIVITY_FACTORS.get(activity_level)
    goal_adjustment = GOAL_ADJUSTMENTS.get(goal_type)

    if activity_factor is None:
        raise ValueError("Invalid activity level")

    if goal_adjustment is None:
        raise ValueError("Invalid goal type")

    calories = round(
        resting_calories * activity_factor + goal_adjustment
    )

    protein_grams = round(weight_kg * 1.6)
    fat_grams = round((calories * 0.25) / 9)

    protein_calories = protein_grams * 4
    fat_calories = fat_grams * 9

    carbohydrate_grams = round(
        max(calories - protein_calories - fat_calories, 0) / 4
    )

    return NutritionCalculation(
        calories=calories,
        protein_grams=protein_grams,
        carbohydrate_grams=carbohydrate_grams,
        fat_grams=fat_grams,
    )