from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Book, ReadingListItem, Recommendation, User, UserRating
from app.db.session import get_db
from app.ml.svd import estimate_user_profile, load_model_artifact, predict_with_profile
from app.schemas import (
    ReadingListCreate,
    ReadingListOut,
    ReadingListPatch,
    RecommendationItem,
    RecommendationList,
    UserRatingOut,
    UserRatingUpsert,
)

router = APIRouter(prefix="/users/me", tags=["recommendations"])
MODEL_ARTIFACT_PATH = Path(__file__).resolve().parents[3] / "dataset" / "svd_model_latest"


def _fallback_recommendations(db: Session, user: User, limit: int) -> list[RecommendationItem]:
    preferences = [value for value in user.preferences.split(",") if value]
    query = select(Book).order_by(Book.rating.desc())
    books = db.scalars(query).all()
    if preferences:
        books.sort(key=lambda book: (book.genre not in preferences, -book.rating))
    selected = books[:limit]
    return [
        RecommendationItem(
            book=book,
            reason="Based on your preferences" if book.genre in preferences else "Popular among readers",
            predicted_rating=book.rating,
            rank=index + 1,
        )
        for index, book in enumerate(selected)
    ]


def _svd_recommendations(db: Session, user: User, limit: int) -> list[RecommendationItem]:
    model = load_model_artifact(MODEL_ARTIFACT_PATH)
    if model is None:
        return []

    ratings_rows = db.scalars(select(UserRating).where(UserRating.user_id == user.id)).all()
    if not ratings_rows:
        return []

    rated_book_ids = {row.book_id for row in ratings_rows}
    rated_books = db.scalars(select(Book).where(Book.id.in_(rated_book_ids))).all() if rated_book_ids else []
    isbn_by_book_id = {book.id: book.isbn for book in rated_books}
    user_ratings = [
        (isbn_by_book_id[row.book_id], float(row.stars))
        for row in ratings_rows
        if row.book_id in isbn_by_book_id
    ]
    profile = estimate_user_profile(model=model, user_ratings=user_ratings)
    if profile is None:
        return []

    candidates = db.scalars(select(Book).where(~Book.id.in_(rated_book_ids)).limit(5000)).all()
    scored: list[tuple[Book, float]] = []
    for book in candidates:
        predicted = predict_with_profile(model=model, isbn=book.isbn, user_profile=profile)
        if predicted is None:
            continue
        scored.append((book, predicted))
    scored.sort(key=lambda item: item[1], reverse=True)
    top = scored[:limit]
    return [
        RecommendationItem(
            book=book,
            reason="Predicted by SVD collaborative filtering from your ratings",
            predicted_rating=round(score, 2),
            rank=index + 1,
        )
        for index, (book, score) in enumerate(top)
    ]


@router.get("/recommendations", response_model=RecommendationList)
def get_recommendations(
    limit: int = Query(default=6, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecommendationList:
    svd_items = _svd_recommendations(db, current_user, limit)
    if svd_items:
        return RecommendationList(items=svd_items)

    rows = db.scalars(
        select(Recommendation)
        .where(Recommendation.user_id == current_user.id)
        .order_by(asc(Recommendation.rank))
        .limit(limit)
    ).all()
    if not rows:
        return RecommendationList(items=_fallback_recommendations(db, current_user, limit))

    items: list[RecommendationItem] = []
    for row in rows:
        book = db.get(Book, row.book_id)
        if book is None:
            continue
        items.append(
            RecommendationItem(
                book=book,
                reason=row.reason,
                predicted_rating=row.predicted_rating,
                rank=row.rank,
            )
        )
    return RecommendationList(items=items)


@router.put("/ratings/{book_id}", response_model=UserRatingOut)
def upsert_rating(
    book_id: int,
    payload: UserRatingUpsert,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserRatingOut:
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    rating = db.scalar(
        select(UserRating).where(UserRating.user_id == current_user.id, UserRating.book_id == book_id)
    )
    now = datetime.utcnow()
    if rating is None:
        rating = UserRating(user_id=current_user.id, book_id=book_id, stars=payload.stars, updated_at=now)
    else:
        rating.stars = payload.stars
        rating.updated_at = now
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return UserRatingOut(book_id=rating.book_id, stars=rating.stars, updated_at=rating.updated_at)


@router.get("/ratings", response_model=list[UserRatingOut])
def list_ratings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[UserRatingOut]:
    rows = db.scalars(
        select(UserRating).where(UserRating.user_id == current_user.id).order_by(UserRating.updated_at.desc())
    ).all()
    return [UserRatingOut(book_id=row.book_id, stars=row.stars, updated_at=row.updated_at) for row in rows]


@router.post("/reading-list", response_model=ReadingListOut, status_code=status.HTTP_201_CREATED)
def create_reading_list_item(
    payload: ReadingListCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReadingListOut:
    book = db.get(Book, payload.book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    item = db.scalar(
        select(ReadingListItem).where(
            ReadingListItem.user_id == current_user.id,
            ReadingListItem.book_id == payload.book_id,
        )
    )
    now = datetime.utcnow()
    if item is None:
        item = ReadingListItem(
            user_id=current_user.id,
            book_id=payload.book_id,
            status=payload.status,
            created_at=now,
            updated_at=now,
        )
    else:
        item.status = payload.status
        item.updated_at = now
    db.add(item)
    db.commit()
    db.refresh(item)
    return ReadingListOut(book_id=item.book_id, status=item.status, created_at=item.created_at, updated_at=item.updated_at)


@router.patch("/reading-list/{book_id}", response_model=ReadingListOut)
def patch_reading_list_item(
    book_id: int,
    payload: ReadingListPatch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReadingListOut:
    item = db.scalar(
        select(ReadingListItem).where(
            ReadingListItem.user_id == current_user.id,
            ReadingListItem.book_id == book_id,
        )
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Reading list item not found")
    item.status = payload.status
    item.updated_at = datetime.utcnow()
    db.add(item)
    db.commit()
    db.refresh(item)
    return ReadingListOut(book_id=item.book_id, status=item.status, created_at=item.created_at, updated_at=item.updated_at)


@router.delete("/reading-list/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reading_list_item(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    item = db.scalar(
        select(ReadingListItem).where(
            ReadingListItem.user_id == current_user.id,
            ReadingListItem.book_id == book_id,
        )
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Reading list item not found")
    db.delete(item)
    db.commit()
