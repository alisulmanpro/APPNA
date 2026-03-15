from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Committee(Base):
    __tablename__ = "committees"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    description = Column(String)

    chapter_id = Column(Integer, ForeignKey("chapters.id"))

    chapter = relationship("Chapter")