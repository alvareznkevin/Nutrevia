from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    GoogleLogin,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
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

    if (
        user is None
        or user.password_hash is None
        or not verify_password(data.password, user.password_hash)
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


@router.post(
    "/google",
    response_model=TokenResponse,
)
def login_with_google(
    data: GoogleLogin,
    database: DatabaseSession,
) -> TokenResponse:
    try:
        google_payload = google_id_token.verify_oauth2_token(
            data.id_token,
            Request(),
            settings.google_client_id,
        )
    except (ValueError, GoogleAuthError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token de Google no es válido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    google_sub = google_payload.get("sub")
    email = google_payload.get("email")
    email_verified = google_payload.get("email_verified", False)

    if not google_sub or not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google no pudo verificar el correo del usuario.",
        )

    normalized_email = str(email).lower()

    user = database.scalar(
        select(User).where(User.google_sub == google_sub)
    )

    if user is None:
        user = database.scalar(
            select(User).where(User.email == normalized_email)
        )

        if user is None:
            user = User(
                email=normalized_email,
                password_hash=None,
                google_sub=google_sub,
            )
            database.add(user)
        elif user.google_sub is None:
            # Vincula una cuenta tradicional existente con Google.
            user.google_sub = google_sub
        elif user.google_sub != google_sub:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este correo ya está vinculado con otra cuenta de Google.",
            )

        try:
            database.commit()
        except IntegrityError:
            database.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No fue posible vincular la cuenta de Google.",
            )

        database.refresh(user)

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