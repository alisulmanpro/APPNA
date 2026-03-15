from sqlalchemy import Column, Integer, String
from app.core.database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    region = Column(String)
    country = Column(String)