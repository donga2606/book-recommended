import csv
import os
from collections import defaultdict
from pathlib import Path

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.models import (
    AnalyticsPopularBook,
    AnalyticsTopRatedBook,
    AnalyticsUserActivity,
    Book,
    ModelExperiment,
    ModelMetrics,
    ReadingListItem,
    ReadingStatusEnum,
    Recommendation,
    RoleEnum,
    User,
    UserRating,
)


DATASET_DIR = Path(__file__).resolve().parents[2] / "dataset"
BOOKS_CSV_PATH = DATASET_DIR / "BX-Books.csv"
RATINGS_CSV_PATH = DATASET_DIR / "BX-Book-Ratings.csv"


def _to_int(value: str, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _infer_genre(title: str) -> str:
    lowered = title.lower()
    if any(token in lowered for token in ("murder", "mystery", "detective", "crime")):
        return "Mystery"
    if any(token in lowered for token in ("love", "romance", "wedding", "heart")):
        return "Romance"
    if any(token in lowered for token in ("dragon", "magic", "wizard", "fantasy")):
        return "Fantasy"
    if any(token in lowered for token in ("space", "galaxy", "alien", "robot", "future")):
        return "Science Fiction"
    if any(token in lowered for token in ("history", "war", "empire", "world")):
        return "History"
    if any(token in lowered for token in ("business", "money", "finance", "invest")):
        return "Business"
    return "General"


def _load_average_ratings() -> dict[str, float]:
    if not RATINGS_CSV_PATH.exists():
        return {}

    totals: defaultdict[str, int] = defaultdict(int)
    counts: defaultdict[str, int] = defaultdict(int)
    with RATINGS_CSV_PATH.open("r", encoding="latin-1", newline="") as handle:
        reader = csv.reader(handle, delimiter=";", quotechar='"')
        for row in reader:
            if len(row) < 3:
                continue
            isbn = row[1].strip().strip('"')
            rating = _to_int(row[2].strip().strip('"'), default=0)
            # In Book-Crossing, 0 is implicit feedback, not an explicit rating.
            if not isbn or rating <= 0:
                continue
            totals[isbn] += rating
            counts[isbn] += 1
    # Book-Crossing explicit ratings are on a 1-10 scale; convert to 0-5.
    return {isbn: min(5.0, (totals[isbn] / counts[isbn]) / 2.0) for isbn in counts}


def _load_books_from_dataset(max_books: int, average_ratings: dict[str, float]) -> list[Book]:
    if not BOOKS_CSV_PATH.exists():
        return []

    books: list[Book] = []
    seen_isbns: set[str] = set()
    with BOOKS_CSV_PATH.open("r", encoding="latin-1", newline="") as handle:
        reader = csv.reader(handle, delimiter=";", quotechar='"')
        for row in reader:
            if len(row) < 8:
                continue
            raw_isbn, raw_title, raw_author, raw_year, raw_publisher, raw_thumb, raw_medium, raw_large = row[:8]
            isbn = raw_isbn.strip().strip('"')
            title = raw_title.strip().strip('"')
            author = raw_author.strip().strip('"')
            publisher = raw_publisher.strip().strip('"')
            if not isbn or isbn in seen_isbns or not title or not author:
                continue

            year = _to_int(raw_year.strip().strip('"'))
            if year < 0 or year > 2100:
                year = 0

            cover_url = raw_large.strip().strip('"') or raw_medium.strip().strip('"') or raw_thumb.strip().strip('"')
            if not cover_url:
                cover_url = "https://via.placeholder.com/300x450?text=No+Cover"

            books.append(
                Book(
                    title=title,
                    author=author,
                    genre=_infer_genre(title),
                    rating=round(float(average_ratings.get(isbn, 0.0)), 2),
                    cover_url=cover_url,
                    description=f"Publisher: {publisher or 'Unknown'}",
                    year_published=year,
                    page_count=0,
                    isbn=isbn,
                )
            )
            seen_isbns.add(isbn)

            if len(books) >= max_books:
                break
    return books


def seed_data(db: Session) -> None:
    if db.scalar(select(Book.id).limit(1)) is not None:
        # Backward-compatibility fix for DBs seeded before rating scale normalization.
        if db.scalar(select(Book.id).where(Book.rating > 5).limit(1)) is not None:
            db.execute(
                update(Book)
                .where(Book.rating > 5)
                .values(rating=func.round(Book.rating / 2.0, 2))
            )
            db.commit()
        return

    users = [
        User(
            name="Alex Johnson",
            email="alex.johnson@example.com",
            avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            role=RoleEnum.user,
            password_hash=get_password_hash("password123"),
            preferences="Science Fiction,Mystery,Fantasy",
        ),
        User(
            name="Admin User",
            email="admin@example.com",
            avatar=None,
            role=RoleEnum.admin,
            password_hash=get_password_hash("password123"),
            preferences="",
        ),
        User(
            name="Data Scientist",
            email="datasci@example.com",
            avatar=None,
            role=RoleEnum.data_scientist,
            password_hash=get_password_hash("password123"),
            preferences="Science Fiction",
        ),
    ]
    db.add_all(users)
    seed_book_limit = _to_int(os.getenv("SEED_BOOK_LIMIT", "20000"), default=20000)
    with_ratings = os.getenv("SEED_WITH_RATINGS", "1").lower() not in {"0", "false", "no"}
    average_ratings = _load_average_ratings() if with_ratings else {}
    books = _load_books_from_dataset(max_books=seed_book_limit, average_ratings=average_ratings)
    if not books:
        raise RuntimeError(
            "No books found to seed. Expected dataset CSV at backend/dataset/BX-Books.csv."
        )
    db.add_all(books)
    db.flush()

    seeded_book_ids = list(db.scalars(select(Book.id).order_by(Book.id.asc()).limit(12)).all())
    if len(seeded_book_ids) < 12:
        raise RuntimeError("Expected at least 12 seeded books from dataset.")

    db.add_all(
        [
            Recommendation(user_id=1, book_id=seeded_book_ids[1], reason="Based on your reading profile", predicted_rating=4.4, rank=1),
            Recommendation(user_id=1, book_id=seeded_book_ids[7], reason="Similar readers rated this highly", predicted_rating=4.2, rank=2),
            Recommendation(user_id=1, book_id=seeded_book_ids[6], reason="Popular in your browsing category", predicted_rating=4.1, rank=3),
            Recommendation(user_id=1, book_id=seeded_book_ids[10], reason="Frequently read together with your books", predicted_rating=4.0, rank=4),
            Recommendation(user_id=1, book_id=seeded_book_ids[2], reason="Readers with similar tastes liked it", predicted_rating=4.0, rank=5),
            Recommendation(user_id=1, book_id=seeded_book_ids[4], reason="Trending title this week", predicted_rating=3.9, rank=6),
        ]
    )

    db.add_all(
        [
            ReadingListItem(user_id=1, book_id=seeded_book_ids[0], status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=seeded_book_ids[2], status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=seeded_book_ids[4], status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=seeded_book_ids[6], status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=seeded_book_ids[8], status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=seeded_book_ids[10], status=ReadingStatusEnum.completed),
        ]
    )

    db.add_all(
        [
            UserRating(user_id=1, book_id=seeded_book_ids[1], stars=5),
            UserRating(user_id=1, book_id=seeded_book_ids[7], stars=5),
            UserRating(user_id=1, book_id=seeded_book_ids[5], stars=4),
        ]
    )

    db.add_all(
        [
            ModelExperiment(version="SVD (default)", factors=100, rmse=0.824, status="archived", date="2026-04-05"),
            ModelExperiment(version="SVD (50 factors)", factors=50, rmse=0.891, status="archived", date="2026-03-28"),
            ModelExperiment(version="SVD (100 factors)", factors=100, rmse=0.824, status="active", date="2026-04-05"),
            ModelExperiment(version="SVD (150 factors)", factors=150, rmse=0.817, status="testing", date="2026-04-08"),
            ModelExperiment(version="SVD (200 factors)", factors=200, rmse=0.834, status="archived", date="2026-04-10"),
        ]
    )

    db.add(
        ModelMetrics(
            train_rmse=0.782,
            test_rmse=0.824,
            accuracy=87.5,
            precision=84.2,
            recall=89.3,
            f1_score=86.7,
            last_trained="2026-04-05T14:30:00Z",
            training_duration="2h 15m",
        )
    )

    db.add_all(
        [
            AnalyticsUserActivity(month="Oct", users=245, active_readers=198),
            AnalyticsUserActivity(month="Nov", users=289, active_readers=234),
            AnalyticsUserActivity(month="Dec", users=312, active_readers=267),
            AnalyticsUserActivity(month="Jan", users=356, active_readers=298),
            AnalyticsUserActivity(month="Feb", users=402, active_readers=345),
            AnalyticsUserActivity(month="Mar", users=445, active_readers=389),
        ]
    )

    db.add_all(
        [
            AnalyticsPopularBook(title=books[0].title, reads=342),
            AnalyticsPopularBook(title=books[1].title, reads=298),
            AnalyticsPopularBook(title=books[2].title, reads=276),
            AnalyticsPopularBook(title=books[3].title, reads=265),
            AnalyticsPopularBook(title=books[4].title, reads=234),
        ]
    )

    db.add_all(
        [
            AnalyticsTopRatedBook(title=books[0].title, ratings_count=487, avg_rating=max(books[0].rating, 3.5)),
            AnalyticsTopRatedBook(title=books[1].title, ratings_count=445, avg_rating=max(books[1].rating, 3.5)),
            AnalyticsTopRatedBook(title=books[2].title, ratings_count=423, avg_rating=max(books[2].rating, 3.5)),
            AnalyticsTopRatedBook(title=books[3].title, ratings_count=398, avg_rating=max(books[3].rating, 3.5)),
            AnalyticsTopRatedBook(title=books[4].title, ratings_count=376, avg_rating=max(books[4].rating, 3.5)),
            AnalyticsTopRatedBook(title=books[5].title, ratings_count=354, avg_rating=max(books[5].rating, 3.5)),
            AnalyticsTopRatedBook(title=books[6].title, ratings_count=332, avg_rating=max(books[6].rating, 3.5)),
            AnalyticsTopRatedBook(title=books[7].title, ratings_count=312, avg_rating=max(books[7].rating, 3.5)),
            AnalyticsTopRatedBook(title=books[8].title, ratings_count=298, avg_rating=max(books[8].rating, 3.5)),
            AnalyticsTopRatedBook(title=books[9].title, ratings_count=276, avg_rating=max(books[9].rating, 3.5)),
        ]
    )

    db.commit()
