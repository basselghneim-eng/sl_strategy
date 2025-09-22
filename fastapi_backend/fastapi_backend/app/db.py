from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Text
from .config import settings
import json

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {})

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)

class Strategy(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)
    name: str = Field(default="Untitled Strategy")
    data: str = Field(sa_column=Column(Text), default="{}")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def set_data(self, obj): self.data = json.dumps(obj, ensure_ascii=False)
    def get_data(self):
        try: return json.loads(self.data or "{}")
        except Exception: return {}

def init_db():
    SQLModel.metadata.create_all(engine)
