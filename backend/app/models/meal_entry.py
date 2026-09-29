from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MealEntry(Base):
    __tablename__ = "meal_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    recorded_on: Mapped[date] = mapped_column(Date, index=True)
    meal_type: Mapped[str] = mapped_column(String(20))
    source: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(String(500))
    calories: Mapped[int] = mapped_column(Integer)
    protein_grams: Mapped[Decimal] = mapped_column(Numeric(8, 1))
    carb_grams: Mapped[Decimal] = mapped_column(Numeric(8, 1))
    fat_grams: Mapped[Decimal] = mapped_column(Numeric(8, 1))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
