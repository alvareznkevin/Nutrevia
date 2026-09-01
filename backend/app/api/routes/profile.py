from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import (
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)


router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)

DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(
    data: ProfileCreate,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> Profile:
    existing_profile = database.scalar(
        select(Profile).where(Profile.user_id == current_user.id)
    )

    if existing_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El usuario ya tiene un perfil.",
        )

    profile = Profile(
        user_id=current_user.id,
        age=data.age,
        height_cm=data.height_cm,
        current_weight_kg=data.current_weight_kg,
        activity_level=data.activity_level.value,
        calculation_sex=data.calculation_sex.value,
    )

    database.add(profile)
    database.commit()
    database.refresh(profile)

    return profile


@router.get(
    "/me",
    response_model=ProfileResponse,
)
def get_my_profile(
    current_user: CurrentUser,
    database: DatabaseSession,
) -> Profile:
    profile = database.scalar(
        select(Profile).where(Profile.user_id == current_user.id)
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario todavía no tiene un perfil.",
        )

    return profile


@router.patch(
    "/me",
    response_model=ProfileResponse,
)
def update_my_profile(
    data: ProfileUpdate,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> Profile:
    profile = database.scalar(
        select(Profile).where(Profile.user_id == current_user.id)
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario todavía no tiene un perfil.",
        )

    changes = data.model_dump(exclude_unset=True)

    if "activity_level" in changes:
        changes["activity_level"] = changes["activity_level"].value

    if "calculation_sex" in changes:
        changes["calculation_sex"] = changes["calculation_sex"].value
 

    for field, value in changes.items():
        setattr(profile, field, value)

    

    database.commit()
    database.refresh(profile)

    return profile