import io
import json
import os
from unittest.mock import patch

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite://")
os.environ.setdefault("JWT_SECRET_KEY", "isolated-test-key")
os.environ.setdefault("GOOGLE_CLIENT_ID", "isolated-test-client")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.api.dependencies.auth import get_current_user
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.nutrition_goal import NutritionGoal
from app.models.user import User


def test_meals_are_persistent_and_user_scoped():
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)
    with session_factory() as db:
        db.add_all([
            User(id=1, email="a@example.invalid", is_active=True),
            User(id=2, email="b@example.invalid", is_active=True),
            NutritionGoal(
                user_id=1, goal_type="maintain", daily_calories=2000,
                protein_grams=100, carbohydrate_grams=250, fat_grams=60,
            ),
            NutritionGoal(
                user_id=2, goal_type="maintain", daily_calories=1800,
                protein_grams=90, carbohydrate_grams=225, fat_grams=50,
            ),
        ])
        db.commit()

    active_user = 1

    def database_override():
        with session_factory() as db:
            yield db

    def user_override():
        with session_factory() as db:
            return db.get(User, active_user)

    app.dependency_overrides[get_db] = database_override
    app.dependency_overrides[get_current_user] = user_override
    try:
        with TestClient(app) as client:
            meal = client.post("/meals", json={
                "recorded_on": "2026-09-29",
                "meal_type": "almuerzo",
                "source": "manual",
                "items": [{
                    "name": "Arroz", "grams": 150,
                    "calories_per_100g": 130, "protein_per_100g": 2.4,
                    "carbs_per_100g": 28, "fat_per_100g": 0.3,
                }],
            })
            assert meal.status_code == 201, meal.text
            entry_id = meal.json()["id"]
            assert meal.json()["calories"] == 195

            summary = client.get("/meals/summary?date=2026-09-29")
            assert summary.status_code == 200, summary.text
            assert summary.json()["consumed_calories"] == 195
            assert summary.json()["consumed_carbs"] == 42
            assert len(summary.json()["meals"]) == 1
            assert client.get("/meals/summary?date=2026-09-28").json()["meals"] == []

            photo = client.post("/meals", json={
                "recorded_on": "2026-09-29", "meal_type": "cena", "source": "photo",
                "items": [{"detection_key": "rice", "name": "Arroz", "grams": 100}],
            })
            assert photo.status_code == 201 and photo.json()["calories"] == 130, photo.text

            with patch("app.api.routes.meals.get_food_by_barcode", return_value={
                "name": "Barrita", "calories_per_100g": 490,
                "protein_per_100g": 24, "carbs_per_100g": 34.6,
                "fat_per_100g": 28.7,
            }):
                barcode = client.post("/meals", json={
                    "recorded_on": "2026-09-29", "meal_type": "snack", "source": "barcode",
                    "items": [{"barcode": "12345678", "grams": 100}],
                })
            assert barcode.status_code == 201 and barcode.json()["calories"] == 490, barcode.text
            assert client.get("/meals/summary?date=2026-09-29").json()["consumed_calories"] == 815

            active_user = 2
            assert client.get("/meals/summary?date=2026-09-29").json()["meals"] == []
            assert client.delete(f"/meals/{entry_id}").status_code == 404

            active_user = 1
            assert client.delete(f"/meals/{entry_id}").status_code == 204
            assert client.delete(f"/meals/{photo.json()['id']}").status_code == 204
            assert client.delete(f"/meals/{barcode.json()['id']}").status_code == 204
            assert client.get("/meals/summary?date=2026-09-29").json()["consumed_calories"] == 0
    finally:
        app.dependency_overrides.clear()
        engine.dispose()


def test_search_maps_open_food_facts_results():
    class Response(io.BytesIO):
        def __enter__(self):
            return self

        def __exit__(self, *args):
            self.close()

    payload = {
        "hits": [{
            "code": "12345678", "product_name_es": "Galletas",
            "nutriments": {
                "energy-kcal_100g": 450, "proteins_100g": 8,
                "carbohydrates_100g": 65, "fat_100g": 18,
            },
        }],
    }
    with patch("app.api.routes.barcode.urlopen", return_value=Response(json.dumps(payload).encode())):
        with TestClient(app) as client:
            response = client.get("/foods/search?q=galletas")
            assert response.status_code == 200, response.text
            assert response.json()[0]["name"] == "Galletas"
            assert response.json()[0]["calories_per_100g"] == 450
