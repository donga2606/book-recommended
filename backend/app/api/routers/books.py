from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db.models import Book
from app.db.session import get_db
from app.schemas import BookOut, PaginatedBooks

router = APIRouter(prefix="/books", tags=["books"])
meta_router = APIRouter(tags=["books"])


@router.get("", response_model=PaginatedBooks)
def list_books(
    q: str | None = None,
    genre: str | None = None,
    min_rating: float = Query(default=0.0, ge=0, le=5),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedBooks:
    filters = [Book.rating >= min_rating]
    if q:
        like_q = f"%{q.lower()}%"
        filters.append(or_(func.lower(Book.title).like(like_q), func.lower(Book.author).like(like_q)))
    if genre and genre.lower() != "all":
        filters.append(Book.genre == genre)

    total = db.scalar(select(func.count()).select_from(Book).where(*filters)) or 0
    query = (
        select(Book)
        .where(*filters)
        .order_by(Book.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    books = list(db.scalars(query).all())
    return PaginatedBooks(items=[BookOut.model_validate(book) for book in books], total=total, page=page, page_size=page_size)


@meta_router.get("/genres", response_model=list[str])
def list_genres(db: Session = Depends(get_db)) -> list[str]:
    genres = [row[0] for row in db.execute(select(Book.genre).distinct().order_by(Book.genre.asc())).all()]
    return ["All", *genres]


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Session = Depends(get_db)) -> BookOut:
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return BookOut.model_validate(book)


@router.get("/{book_id}/similar", response_model=list[BookOut])
def get_similar_books(
    book_id: int, limit: int = Query(default=4, ge=1, le=20), db: Session = Depends(get_db)
) -> list[BookOut]:
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    similar = db.scalars(select(Book).where(Book.genre == book.genre, Book.id != book.id).limit(limit)).all()
    return [BookOut.model_validate(item) for item in similar]


