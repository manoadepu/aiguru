from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from uuid import UUID

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get(
    "/me", 
    response_model=schemas.User,
    summary="Get current user profile",
    description="Get authenticated user's own profile information",
    responses={
        200: {
            "description": "Successful retrieval of user profile",
            "content": {
                "application/json": {
                    "example": {
                        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "email": "user@example.com",
                        "name": "User Name",
                        "is_active": True,
                        "is_superuser": False
                    }
                }
            }
        },
        401: {"description": "Not authenticated"}
    }
)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user profile.
    """
    return current_user


@router.put(
    "/me", 
    response_model=schemas.User,
    summary="Update current user",
    description="Update authenticated user's own profile information",
    responses={
        200: {
            "description": "User profile successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "email": "user@example.com",
                        "name": "Updated Name",
                        "is_active": True,
                        "is_superuser": False
                    }
                }
            }
        },
        401: {"description": "Not authenticated"}
    }
)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    name: str = Body(None, description="New user name"),
    password: str = Body(None, description="New password"),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user profile.
    """
    user_in = schemas.UserUpdate(
        name=name,
        password=password,
    )
    
    user = crud.user.update(db, db_obj=current_user, obj_in=user_in)
    return user


@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: UUID,
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    # Only allow users to access their own profile unless they are superusers
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this user"
        )
        
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    return user


@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve users.
    Only available to superusers.
    """
    users = crud.user.get_multi(db, skip=skip, limit=limit)
    return users
