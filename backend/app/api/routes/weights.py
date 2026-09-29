from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.weight_entry import WeightEntry
from app.schemas.weight_entry import WeightEntryCreate, WeightEntryResponse


router = APIRouter(prefix="/weights", tags=["Weights"])

DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=list[WeightEntryResponse])
def get_weights(
    current_user: CurrentUser,
    database: DatabaseSession,
) -> list[WeightEntry]:
    return list(database.scalars(
        select(WeightEntry)
        .where(WeightEntry.user_id == current_user.id)
        .order_by(WeightEntry.recorded_on, WeightEntry.id)
    ))


@router.post("", response_model=WeightEntryResponse)
def save_weight(
    data: WeightEntryCreate,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> WeightEntry:
    entry = database.scalar(
        select(WeightEntry).where(
            WeightEntry.user_id == current_user.id,
            WeightEntry.recorded_on == data.recorded_on,
        )
    )

    if entry is None:
        entry = WeightEntry(
            user_id=current_user.id,
            recorded_on=data.recorded_on,
            weight_kg=data.weight_kg,
        )
        database.add(entry)
    else:
        entry.weight_kg = data.weight_kg

    database.commit()
    database.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_weight(
    entry_id: int,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> None:
    entry = database.scalar(
        select(WeightEntry).where(
            WeightEntry.id == entry_id,
            WeightEntry.user_id == current_user.id,
        )
    )

    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de peso no encontrado.",
        )

    database.delete(entry)
    database.commit()