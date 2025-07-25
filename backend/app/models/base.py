import uuid
from datetime import datetime
from typing import Any, ClassVar, Dict, Type

from sqlalchemy import DateTime, MetaData
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, declared_attr
from sqlalchemy.dialects.postgresql import UUID


class Base(DeclarativeBase):
    """
    Base class for all database models.
    Provides common fields and functionality.
    """
    # Allow legacy style column definitions temporarily for compatibility
    __allow_unmapped__ = True
    
    # Generate __tablename__ automatically based on class name
    @declared_attr.directive
    @classmethod
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
    
    # Common columns for all tables
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
