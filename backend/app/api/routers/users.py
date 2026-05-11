from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import ReadingListItem, ReadingStatusEnum, User
from app.db.session import get_db
from app.schemas import UserOut, UserPatch

router = APIRouter(prefix="/users", tags=["users"])


def _to_user_out(db: Session, user: User) -> UserOut:
    completed = db.scalars(
        select(ReadingListItem.book_id).where(
            ReadingListItem.user_id == user.id,
            ReadingListItem.status == ReadingStatusEnum.completed,
        )
    ).all()
    preferences = [value for value in user.preferences.split(",") if value]
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        role=user.role,
        preferences=preferences,
        reading_history=list(completed),
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserOut:
    return _to_user_out(db, current_user)


@router.patch("/me", response_model=UserOut)
def patch_me(payload: UserPatch, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserOut:
    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data:
        current_user.name = update_data["name"]
    if "email" in update_data:
        current_user.email = update_data["email"]
    if "avatar" in update_data:
        current_user.avatar = update_data["avatar"]
    if "preferences" in update_data and update_data["preferences"] is not None:
        current_user.preferences = ",".join(update_data["preferences"])
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return _to_user_out(db, current_user)
