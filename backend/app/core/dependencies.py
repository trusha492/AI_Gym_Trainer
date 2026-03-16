from fastapi import Depends, HTTPException, Request, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.user import User
from app.core.security import oauth2_scheme, SECRET_KEY, ALGORITHM

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing token",
    )

    raw_token = token
    if not raw_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header:
            raw_token = auth_header
        else:
            raw_token = request.cookies.get("access_token") or request.query_params.get("token", "")

    normalized_token = (raw_token or "").strip()
    if normalized_token.lower().startswith("bearer "):
        normalized_token = normalized_token.split(" ", 1)[1].strip()
    if not normalized_token:
        raise credentials_exception

    try:
        payload = jwt.decode(normalized_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise credentials_exception

    return user


def admin_only(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
def get_current_user_optional(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    raw_token = token
    if not raw_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header:
            raw_token = auth_header
        else:
            raw_token = request.cookies.get("access_token") or request.query_params.get("token", "")

    normalized_token = (raw_token or "").strip()
    if normalized_token.lower().startswith("bearer "):
        normalized_token = normalized_token.split(" ", 1)[1].strip()
    if not normalized_token:
        return None

    try:
        payload = jwt.decode(normalized_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            return None
        return db.query(User).filter(User.email == email).first()
    except JWTError:
        return None
