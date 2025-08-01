import uuid
from typing import Optional, List

from sqlalchemy import String, ForeignKey, Float, Boolean, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Quiz(Base):
    """
    Quiz model representing quizzes generated by the AI teacher for a child.
    Each quiz focuses on a specific subject and topic and contains questions.
    """
    __tablename__ = "quiz"
    
    # Quiz details
    subject: Mapped[str] = mapped_column(String, nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    difficulty: Mapped[str] = mapped_column(String, nullable=False)  # 'easy', 'medium', 'hard'
    
    # Foreign key to child
    child_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("child.id"), nullable=False)
    
    # Relationships
    child: Mapped["Child"] = relationship("Child", back_populates="quizzes")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    attempts: Mapped[List["QuizAttempt"]] = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    """
    Question model representing individual questions in a quiz.
    """
    __tablename__ = "question"
    
    # Question details
    text: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)  # 'multiple_choice', 'true_false', 'open_ended'
    options: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)  # For multiple choice questions
    correct_answer: Mapped[str] = mapped_column(String, nullable=False)
    
    # Foreign key to quiz
    quiz_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quiz.id"), nullable=False)
    
    # Relationships
    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="questions")
    answers: Mapped[List["Answer"]] = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class QuizAttempt(Base):
    """
    QuizAttempt model tracking a child's attempt at completing a quiz.
    """
    __tablename__ = "quizattempt"
    
    # Attempt details
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Foreign keys
    quiz_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quiz.id"), nullable=False)
    child_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("child.id"), nullable=False)
    
    # Relationships
    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="attempts")
    child: Mapped["Child"] = relationship("Child")
    answers: Mapped[List["Answer"]] = relationship("Answer", back_populates="attempt", cascade="all, delete-orphan")


class Answer(Base):
    """
    Answer model representing a child's answer to a specific question in a quiz attempt.
    """
    __tablename__ = "answer"
    
    # Answer details
    selected_option: Mapped[str] = mapped_column(String, nullable=False)  # User's answer
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    
    # Foreign keys
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("question.id"), nullable=False)
    attempt_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quizattempt.id"), nullable=False)
    
    # Relationships
    question: Mapped["Question"] = relationship("Question", back_populates="answers")
    attempt: Mapped["QuizAttempt"] = relationship("QuizAttempt", back_populates="answers")
