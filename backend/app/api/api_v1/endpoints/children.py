from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get(
    "/", 
    response_model=List[schemas.Child],
    summary="List children profiles",
    description="Retrieve all children profiles belonging to the authenticated parent user",
    responses={
        200: {
            "description": "List of child profiles",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                            "name": "Child Name",
                            "grade": "3rd grade",
                            "subjects": ["Math", "Science"],
                            "learning_style": "Visual",
                            "preferences": {"response_style": "concise"},
                            "parent_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                        }
                    ]
                }
            }
        },
        401: {"description": "Not authenticated"}
    }
)
def read_children(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return"),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve children profiles for the authenticated user.
    """
    children = crud.child.get_multi_by_parent(
        db, parent_id=current_user.id, skip=skip, limit=limit
    )
    return children


@router.post(
    "/", 
    response_model=schemas.Child,
    summary="Create child profile",
    description="Create a new child profile for the authenticated parent user",
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "Child profile successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "name": "Child Name",
                        "grade": "3rd grade",
                        "subjects": ["Math", "Science"],
                        "learning_style": "Visual",
                        "preferences": {"response_style": "concise"},
                        "parent_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error"}
    }
)
def create_child(
    *,
    db: Session = Depends(deps.get_db),
    child_in: schemas.ChildCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new child profile.
    """
    # Input validation - ensure at least one subject is provided
    if not child_in.subjects or len(child_in.subjects) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one subject must be specified",
        )
    
    # Create child profile with parent reference
    child = crud.child.create_with_parent(
        db=db, obj_in=child_in, parent_id=current_user.id
    )
    return child


@router.get(
    "/{child_id}", 
    response_model=schemas.ChildDetail,
    summary="Get child profile",
    description="Get a specific child profile by ID for the authenticated parent user",
    responses={
        200: {
            "description": "Child profile details",
            "content": {
                "application/json": {
                    "example": {
                        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "name": "Child Name",
                        "grade": "3rd grade",
                        "subjects": ["Math", "Science"],
                        "learning_style": "Visual",
                        "preferences": {"response_style": "concise"},
                        "parent_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "sessions": [],
                        "quizzes": []
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        404: {"description": "Child profile not found or inaccessible"}
    }
)
def read_child(
    *,
    db: Session = Depends(deps.get_db),
    child_id: UUID = Path(..., description="The ID of the child to retrieve"),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get a specific child profile by ID.
    """
    # Get child and verify ownership
    child = crud.child.get_by_id_and_parent(
        db=db, id=child_id, parent_id=current_user.id
    )
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child profile not found or you don't have access to it",
        )
    return child


@router.put(
    "/{child_id}", 
    response_model=schemas.Child,
    summary="Update child profile",
    description="Update a specific child profile by ID for the authenticated parent user",
    responses={
        200: {
            "description": "Child profile successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "name": "Updated Child Name",
                        "grade": "4th grade",
                        "subjects": ["Math", "Science", "Art"],
                        "learning_style": "Visual",
                        "preferences": {"response_style": "detailed"},
                        "parent_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        404: {"description": "Child profile not found or inaccessible"},
        422: {"description": "Validation error"}
    }
)
def update_child(
    *,
    db: Session = Depends(deps.get_db),
    child_id: UUID = Path(..., description="The ID of the child to update"),
    child_in: schemas.ChildUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a child profile.
    """
    # Get child and verify ownership
    child = crud.child.get_by_id_and_parent(
        db=db, id=child_id, parent_id=current_user.id
    )
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child profile not found or you don't have access to it",
        )
    
    # Input validation if subjects are being updated
    if child_in.subjects is not None and len(child_in.subjects) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one subject must be specified",
        )
    
    # Update child profile
    updated_child = crud.child.update_child_profile(
        db=db, db_obj=child, obj_in=child_in
    )
    return updated_child


@router.delete(
    "/{child_id}", 
    response_model=schemas.Child,
    summary="Delete child profile",
    description="Delete a specific child profile by ID for the authenticated parent user",
    responses={
        200: {
            "description": "Child profile successfully deleted",
            "content": {
                "application/json": {
                    "example": {
                        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "name": "Child Name",
                        "grade": "3rd grade",
                        "subjects": ["Math", "Science"],
                        "learning_style": "Visual",
                        "preferences": {"response_style": "concise"},
                        "parent_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        404: {"description": "Child profile not found or inaccessible"}
    }
)
def delete_child(
    *,
    db: Session = Depends(deps.get_db),
    child_id: UUID = Path(..., description="The ID of the child to delete"),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a child profile.
    """
    # Get child and verify ownership
    child = crud.child.get_by_id_and_parent(
        db=db, id=child_id, parent_id=current_user.id
    )
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child profile not found or you don't have access to it",
        )
    
    # Delete child profile
    child = crud.child.remove(db=db, id=child_id)
    return child
