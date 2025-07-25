"""
Unit tests for child profile CRUD operations.
"""
import pytest
from uuid import uuid4
from typing import Dict, List, Any

from sqlalchemy.orm import Session

from app import crud
from app.schemas.user import UserCreate
from app.schemas.child import ChildCreate, ChildUpdate
from app.models.child import Child


def create_test_user(db: Session) -> Dict[str, Any]:
    """Helper function to create a test user for child tests."""
    email = f"parent-{uuid4()}@example.com"
    password = "testpass123"
    name = "Test Parent"
    
    user_in = UserCreate(email=email, password=password, name=name)
    user = crud.user.create(db, obj_in=user_in)
    
    return {"user": user, "email": email, "password": password}


def test_create_child(db: Session) -> None:
    """Test creating a child profile."""
    # Create a parent user first
    parent = create_test_user(db)["user"]
    
    # Create a child profile
    child_in = ChildCreate(
        name="Test Child",
        grade="3rd grade",
        subjects=["Math", "Science"],
        learning_style="Visual",
        preferences={
            "response_style": "concise",
            "examples_type": "real-world"
        }
    )
    
    child = crud.child.create_with_parent(
        db=db, obj_in=child_in, parent_id=parent.id
    )
    
    # Verify child was created with correct data
    assert child.name == "Test Child"
    assert child.grade == "3rd grade"
    assert child.subjects == ["Math", "Science"]
    assert child.learning_style == "Visual"
    assert child.preferences == {
        "response_style": "concise",
        "examples_type": "real-world"
    }
    assert child.parent_id == parent.id


def test_get_children_by_parent(db: Session) -> None:
    """Test retrieving children by parent ID."""
    # Create a parent user
    parent = create_test_user(db)["user"]
    
    # Create multiple children for the parent
    for i in range(3):
        child_in = ChildCreate(
            name=f"Child {i}",
            grade=f"{i+1}st grade",
            subjects=["Math"],
            learning_style="Visual" if i % 2 == 0 else "Auditory",
        )
        crud.child.create_with_parent(db=db, obj_in=child_in, parent_id=parent.id)
    
    # Create another parent with a child (to test isolation)
    other_parent = create_test_user(db)["user"]
    other_child = ChildCreate(
        name="Other Child",
        grade="5th grade",
        subjects=["English"],
    )
    crud.child.create_with_parent(db=db, obj_in=other_child, parent_id=other_parent.id)
    
    # Retrieve children for first parent
    children = crud.child.get_multi_by_parent(db=db, parent_id=parent.id)
    
    # Verify correct children were retrieved
    assert len(children) == 3
    for child in children:
        assert child.parent_id == parent.id
        assert "Child" in child.name
    
    # Verify we only get children for the specified parent
    other_parent_children = crud.child.get_multi_by_parent(db=db, parent_id=other_parent.id)
    assert len(other_parent_children) == 1
    assert other_parent_children[0].name == "Other Child"


def test_get_child_by_id_and_parent(db: Session) -> None:
    """Test retrieving a child by ID and parent ID."""
    # Create two parents
    parent1 = create_test_user(db)["user"]
    parent2 = create_test_user(db)["user"]
    
    # Create a child for parent1
    child_in = ChildCreate(
        name="Test Child",
        grade="3rd grade",
        subjects=["Math", "Science"],
    )
    child = crud.child.create_with_parent(db=db, obj_in=child_in, parent_id=parent1.id)
    
    # Test retrieval with correct parent
    retrieved_child = crud.child.get_by_id_and_parent(
        db=db, id=child.id, parent_id=parent1.id
    )
    assert retrieved_child is not None
    assert retrieved_child.id == child.id
    assert retrieved_child.parent_id == parent1.id
    
    # Test retrieval with incorrect parent (should return None)
    wrong_parent_child = crud.child.get_by_id_and_parent(
        db=db, id=child.id, parent_id=parent2.id
    )
    assert wrong_parent_child is None
    
    # Test non-existent child
    non_existent = crud.child.get_by_id_and_parent(
        db=db, id=uuid4(), parent_id=parent1.id
    )
    assert non_existent is None


def test_update_child(db: Session) -> None:
    """Test updating a child profile."""
    # Create a parent and child
    parent = create_test_user(db)["user"]
    child_in = ChildCreate(
        name="Update Test Child",
        grade="3rd grade",
        subjects=["Math"],
    )
    child = crud.child.create_with_parent(db=db, obj_in=child_in, parent_id=parent.id)
    
    # Update some fields
    updated_grade = "4th grade"
    updated_subjects = ["Math", "Science", "Art"]
    child_update = ChildUpdate(
        grade=updated_grade,
        subjects=updated_subjects
    )
    
    updated_child = crud.child.update_child_profile(
        db=db, db_obj=child, obj_in=child_update
    )
    
    # Verify updates
    assert updated_child.name == "Update Test Child"  # Unchanged
    assert updated_child.grade == updated_grade
    assert updated_child.subjects == updated_subjects
    
    # Update using dict with preferences
    new_preferences = {"response_style": "detailed", "examples_type": "abstract"}
    crud.child.update(db, db_obj=updated_child, obj_in={"preferences": new_preferences})
    db.refresh(updated_child)
    assert updated_child.preferences == new_preferences


def test_remove_child(db: Session) -> None:
    """Test deleting a child profile."""
    # Create a parent and child
    parent = create_test_user(db)["user"]
    child_in = ChildCreate(
        name="Delete Test Child",
        grade="3rd grade",
        subjects=["Math"],
    )
    child = crud.child.create_with_parent(db=db, obj_in=child_in, parent_id=parent.id)
    
    # Verify child exists before deletion
    child_id = child.id
    retrieved = crud.child.get(db, id=child_id)
    assert retrieved is not None
    
    # Delete child
    deleted_child = crud.child.remove(db, id=child_id)
    assert deleted_child.id == child_id
    
    # Verify child no longer exists
    retrieved_after = crud.child.get(db, id=child_id)
    assert retrieved_after is None
