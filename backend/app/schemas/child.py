from typing import Dict, List, Optional, Any
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.schemas.base import BaseSchema


class PreferencesSchema(BaseModel):
    """Schema for child learning preferences."""
    response_style: Optional[str] = None  # 'concise', 'detailed', etc.
    examples_type: Optional[str] = None   # 'real-world', 'abstract', etc.


class ChildBase(BaseModel):
    """Base schema for child data."""
    name: str
    grade: str
    subjects: List[str]
    learning_style: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = {}
    
    @validator('subjects')
    def check_subjects_not_empty(cls, v):
        if not v:
            raise ValueError('At least one subject must be specified')
        return v


class ChildCreate(ChildBase):
    """Schema for creating a new child profile."""
    pass


class ChildUpdate(BaseModel):
    """Schema for updating an existing child profile."""
    name: Optional[str] = None
    grade: Optional[str] = None
    subjects: Optional[List[str]] = None
    learning_style: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


class Child(ChildBase, BaseSchema):
    """Schema for returning child data in API responses."""
    parent_id: UUID
    
    class Config:
        orm_mode = True


class ChildDetail(Child):
    """Detailed child schema with related information."""
    # Placeholder for future extensions with session stats, etc.
    pass
