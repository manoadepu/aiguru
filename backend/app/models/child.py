import uuid
from typing import Dict, List, Any, Optional

from sqlalchemy import String, ForeignKey, JSON, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Child(Base):
    """
    Child model representing the student profiles created by parents.
    This is central to our AI Teacher application as each child gets
    a personalized learning experience.
    """
    __tablename__ = "child"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    grade: Mapped[str] = mapped_column(String, nullable=False)
    subjects: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)
    learning_style: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Preferences stored as JSON for flexibility
    preferences: Mapped[Dict[str, Any]] = mapped_column(JSON, default={})
    
    # Foreign key to parent user
    parent_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), nullable=False)
    
    # Relationships
    parent = relationship("User", back_populates="children")
    sessions = relationship("Session", back_populates="child", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="child", cascade="all, delete-orphan")
