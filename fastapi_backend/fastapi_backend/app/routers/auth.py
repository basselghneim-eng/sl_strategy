from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta
from ..db import engine, User
from ..schemas import Token, UserOut
from ..auth import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends()):
    email = (form.username or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email==email)).first()
        if not user:
            user = User(email=email)
            session.add(user); session.commit(); session.refresh(user)
        token = create_access_token(subject=user.email, expires_delta=timedelta(days=30))
        return Token(access_token=token)

@router.get("/me", response_model=UserOut)
def me(token: str):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email==token)).first()
        if not user: raise HTTPException(status_code=401, detail="Invalid token")
        return UserOut(id=user.id, email=user.email)
