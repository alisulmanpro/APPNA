from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)

    specialty = Column(String)

    chapter_id = Column(Integer, ForeignKey("chapters.id"))

    chapter = relationship("Chapter")