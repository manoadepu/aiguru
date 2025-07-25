import uuid
from datetime import datetime
from typing import Optional, List
import enum

from sqlalchemy import String, ForeignKey, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class SessionStatus(str, enum.Enum):
    """Enum for session status to ensure data integrity."""
    ACTIVE = "active"
    COMPLETED = "completed"


class Session(Base):
    """
    Session model representing a learning session between a child and the AI teacher.
    Each session is focused on a specific subject and topic.
    """
    __tablename__ = "session"
    
    # Session details
    subject: Mapped[str] = mapped_column(String, nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[SessionStatus] = mapped_column(Enum(SessionStatus), default=SessionStatus.ACTIVE)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Foreign key to child
    child_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("child.id"), nullable=False)
    
    # Relationships
    child: Mapped["Child"] = relationship("Child", back_populates="sessions")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="session", cascade="all, delete-orphan")


class Message(Base):
    """
    Message model representing individual messages in a session.
    Includes both user (child) messages and AI responses.
    """
    __tablename__ = "message"
    
    # Message content
    content: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)  # 'user', 'assistant', 'system'
    
    # Foreign key to session
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("session.id"), nullable=False)
    
    # Relationships
    session: Mapped["Session"] = relationship("Session", back_populates="messages")
    feedback: Mapped[Optional["Feedback"]] = relationship("Feedback", back_populates="message", uselist=False, cascade="all, delete-orphan")


class Feedback(Base):
    """
    Feedback model for tracking child/parent feedback on AI responses.
    This will be used for improving the AI teacher's responses over time.
    """
    __tablename__ = "feedback"
    
    # Feedback details
    rating: Mapped[str] = mapped_column(String, nullable=False)  # 'thumbs_up', 'thumbs_down'
    comment: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Foreign key to message
    message_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("message.id"), nullable=False, unique=True)
    
    # Relationships
    message: Mapped["Message"] = relationship("Message", back_populates="feedback")
