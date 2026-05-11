from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.models import AnalyticsTopRatedBook, Book, RoleEnum, User
from app.db.session import get_db
from app.schemas import BookCreate, BookOut, BookUpdate, TopRatedBookOut

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_role(RoleEnum.admin))],
)


@router.get("/books", response_model=list[BookOut])
def admin_list_books(
    db: Session = Depends(get_db), _: User = Depends(require_role(RoleEnum.admin))
) -> list[BookOut]:
    books = db.scalars(select(Book).order_by(Book.id.asc())).all()
    return [BookOut.model_validate(book) for book in books]


@router.post("/books", response_model=BookOut, status_code=status.HTTP_201_CREATED)
def admin_create_book(
    payload: BookCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.admin)),
) -> BookOut:
    book = Book(**payload.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return BookOut.model_validate(book)


@router.patch("/books/{book_id}", response_model=BookOut)
def admin_update_book(
    book_id: int,
    payload: BookUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.admin)),
) -> BookOut:
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(book, key, value)
    db.add(book)
    db.commit()
    db.refresh(book)
    return BookOut.model_validate(book)


@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.admin)),
) -> None:
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()


@router.get("/analytics/top-rated", response_model=list[TopRatedBookOut])
def admin_top_rated_books(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.admin)),
) -> list[TopRatedBookOut]:
    rows = db.scalars(
        select(AnalyticsTopRatedBook)
        .order_by(desc(AnalyticsTopRatedBook.ratings_count))
        .limit(limit)
    ).all()
    return [
        TopRatedBookOut(
            title=row.title, ratings_count=row.ratings_count, avg_rating=row.avg_rating
        )
        for row in rows
    ]
