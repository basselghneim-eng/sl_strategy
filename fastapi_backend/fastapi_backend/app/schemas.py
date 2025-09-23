from pydantic import BaseModel, Field
from typing import Any, Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    email: str

class StrategyCreate(BaseModel):
    name: str = Field(default="Untitled Strategy")
    data: Any = Field(default_factory=dict)

class StrategyUpdate(BaseModel):
    name: Optional[str] = None
    data: Any | None = None

class StrategyOut(BaseModel):
    id: int
    name: str
    data: Any
