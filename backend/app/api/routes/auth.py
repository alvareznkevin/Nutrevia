from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.api.dependencies.auth import get_current_user
from app.schemas.auth import UserResponse
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLogin,
    UserRegister,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    data: UserRegister,
    database: DatabaseSession,
) -> TokenResponse:
    normalized_email = str(data.email).lower()

    existing_user = database.scalar(
        select(User).where(User.email == normalized_email)
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta asociada a este correo.",
        )

    user = User(
        email=normalized_email,
        password_hash=hash_password(data.password),
    )

    database.add(user)

    try:
        database.commit()
    except IntegrityError:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta asociada a este correo.",
        )

    database.refresh(user)

    token = create_access_token(user.id)

    return TokenResponse(
        access_token=token,
        user=user,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(
    data: UserLogin,
    database: DatabaseSession,
) -> TokenResponse:
    normalized_email = str(data.email).lower()

    user = database.scalar(
        select(User).where(User.email == normalized_email)
    )

    if user is None or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta se encuentra desactivada.",
        )

    token = create_access_token(user.id)

    return TokenResponse(
        access_token=token,
        user=user,
    )

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_authenticated_user(
    current_user: CurrentUser,
) -> User:
    return current_user