from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.schemas.base import BaseSchema


class UserBase(BaseModel):
    """Base schema for user data."""
    email: EmailStr
    name: str
    is_active: bool = True


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schema for updating an existing user."""
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None


class UserInDB(UserBase, BaseSchema):
    """Schema for user data retrieved from database."""
    is_superuser: bool = False
    hashed_password: str


class User(UserBase, BaseSchema):
    """Schema for returning user data in API responses."""
    pass


class UserWithChildren(User):
    """Schema for user with children relationships."""
    from app.schemas.child import Child
    
    children: list[Child] = []


class Token(BaseModel):
    """Schema for JWT authentication token."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Schema for JWT token payload."""
    sub: Optional[UUID] = None
