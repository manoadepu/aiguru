from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.child import Child
from app.schemas.child import ChildCreate, ChildUpdate


class CRUDChild(CRUDBase[Child, ChildCreate, ChildUpdate]):
    """
    CRUD operations for Child model.
    Extends the base CRUD operations with child-specific functionality.
    """
    
    def get_multi_by_parent(
        self, db: Session, *, parent_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Child]:
        """
        Get all children profiles for a specific parent.
        
        Args:
            db: Database session
            parent_id: ID of the parent user
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of Child objects
        """
        return (
            db.query(self.model)
            .filter(Child.parent_id == parent_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_parent(
        self, db: Session, *, obj_in: ChildCreate, parent_id: UUID
    ) -> Child:
        """
        Create a new child profile with parent reference.
        
        Args:
            db: Database session
            obj_in: Child creation schema
            parent_id: ID of the parent user
            
        Returns:
            Created Child object
        """
        obj_in_data = obj_in.dict()
        db_obj = Child(**obj_in_data, parent_id=parent_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_id_and_parent(
        self, db: Session, *, id: UUID, parent_id: UUID
    ) -> Optional[Child]:
        """
        Get a child profile by ID and parent ID.
        This ensures that a parent can only access their own children's profiles.
        
        Args:
            db: Database session
            id: Child ID
            parent_id: ID of the parent user
            
        Returns:
            Child object if found and belongs to the parent, None otherwise
        """
        return (
            db.query(self.model)
            .filter(Child.id == id, Child.parent_id == parent_id)
            .first()
        )
    
    def update_child_profile(
        self, 
        db: Session, 
        *, 
        db_obj: Child,
        obj_in: Union[ChildUpdate, Dict[str, Any]]
    ) -> Child:
        """
        Update a child profile with validation.
        
        Args:
            db: Database session
            db_obj: Existing child object
            obj_in: Update schema or dictionary
            
        Returns:
            Updated Child object
        """
        # Standard update logic is sufficient here
        # but we can add additional validation if needed in the future
        return super().update(db, db_obj=db_obj, obj_in=obj_in)


# Create a singleton instance
child = CRUDChild(Child)
