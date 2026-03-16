# app/routers/auth.py
from datetime import timedelta, datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User
from app.models.profile import Profile
from app.schemas.auth import AdminRegisterSchema, RegisterSchema
from app.core.security import hash_password, verify_password  # note: no create_access_token import


router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(
    data: RegisterSchema,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_pw = hash_password(data.password)

    user = User(
        name=data.name,
        email=data.email,
        password=hashed_pw,  # <- this column exists on User
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = Profile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {"message": "User registered successfully"}


@router.post("/register-admin")
async def register_admin(
    data: AdminRegisterSchema,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    admin_exists = db.query(User).filter(User.is_admin == True).first() is not None
    required_key = settings.ADMIN_REGISTER_KEY.strip()
    provided_key = (data.admin_key or "").strip()

    # If at least one admin exists, require a valid admin key to create more admins.
    if admin_exists:
        if not required_key or provided_key != required_key:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid admin registration key",
            )

    hashed_pw = hash_password(data.password)
    user = User(
        name=data.name,
        email=data.email,
        password=hashed_pw,
        is_admin=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = Profile(user_id=user.id)
    db.add(profile)
    db.commit()

    return {"message": "Admin registered successfully"}


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


@router.post("/login")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # username sent from frontend is the email
    user = db.query(User).filter(User.email == form_data.username).first()

    # use user.password (your model field), NOT user.hashed_password
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token({"sub": user.email})
    # Swagger same-origin requests can reuse this cookie automatically.
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {"access_token": access_token, "token_type": "bearer"}
