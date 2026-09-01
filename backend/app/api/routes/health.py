from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("")
def health_check():
    return {
        "status": "ok",
        "service": "nutrevia-api",
    }


@router.get("/database")
def database_health_check(
    database: Session = Depends(get_db),
):
    database.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected",
    }