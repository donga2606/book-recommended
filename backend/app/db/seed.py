from sqlalchemy import select
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


def seed_data(db: Session) -> None:
    if db.scalar(select(Book.id).limit(1)) is not None:
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

    books = [
        Book(id=1, title="The Midnight Library", author="Matt Haig", genre="Fiction", rating=4.5, cover_url="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", description="Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.", year_published=2020, page_count=304, isbn="978-0525559474"),
        Book(id=2, title="Project Hail Mary", author="Andy Weir", genre="Science Fiction", rating=4.8, cover_url="https://images.unsplash.com/photo-1614544048536-0d28caf77f41?w=400", description="Ryland Grace is the sole survivor on a desperate, last-chance mission to save both humanity and Earth itself.", year_published=2021, page_count=476, isbn="978-0593135204"),
        Book(id=3, title="The Seven Husbands of Evelyn Hugo", author="Taylor Jenkins Reid", genre="Historical Fiction", rating=4.6, cover_url="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", description="Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life.", year_published=2017, page_count=400, isbn="978-1501161933"),
        Book(id=4, title="Where the Crawdads Sing", author="Delia Owens", genre="Mystery", rating=4.4, cover_url="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400", description="For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast.", year_published=2018, page_count=384, isbn="978-0735219090"),
        Book(id=5, title="The Silent Patient", author="Alex Michaelides", genre="Thriller", rating=4.3, cover_url="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400", description="Alicia Berenson's life is seemingly perfect. Until one evening when she shoots her husband five times in the face.", year_published=2019, page_count=336, isbn="978-1250301697"),
        Book(id=6, title="Atomic Habits", author="James Clear", genre="Self-Help", rating=4.7, cover_url="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400", description="An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework.", year_published=2018, page_count=320, isbn="978-0735211292"),
        Book(id=7, title="The Invisible Life of Addie LaRue", author="V.E. Schwab", genre="Fantasy", rating=4.5, cover_url="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400", description="A Life No One Will Remember. A Story You Will Never Forget. France, 1714: in a moment of desperation, a young woman makes a Faustian bargain.", year_published=2020, page_count=448, isbn="978-0765387561"),
        Book(id=8, title="Dune", author="Frank Herbert", genre="Science Fiction", rating=4.6, cover_url="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400", description="Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling this inhospitable world.", year_published=1965, page_count=688, isbn="978-0441172719"),
        Book(id=9, title="Educated", author="Tara Westover", genre="Biography", rating=4.7, cover_url="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400", description="Born to survivalists in the mountains of Idaho, Tara Westover was seventeen the first time she set foot in a classroom.", year_published=2018, page_count=352, isbn="978-0399590504"),
        Book(id=10, title="The Song of Achilles", author="Madeline Miller", genre="Historical Fiction", rating=4.6, cover_url="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400", description="A tale of gods, kings, immortal fame and the human heart, The Song of Achilles is a dazzling literary feat.", year_published=2012, page_count=416, isbn="978-0062060624"),
        Book(id=11, title="Circe", author="Madeline Miller", genre="Fantasy", rating=4.5, cover_url="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400", description="In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child.", year_published=2018, page_count=400, isbn="978-0316556347"),
        Book(id=12, title="The Psychology of Money", author="Morgan Housel", genre="Business", rating=4.6, cover_url="https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400", description="Doing well with money isn't necessarily about what you know. It's about how you behave.", year_published=2020, page_count=256, isbn="978-0857197689"),
    ]
    db.add_all(books)

    db.add_all(
        [
            Recommendation(user_id=1, book_id=2, reason="Based on your love for science fiction", predicted_rating=4.8, rank=1),
            Recommendation(user_id=1, book_id=8, reason="Fans of sci-fi classics will love this", predicted_rating=4.6, rank=2),
            Recommendation(user_id=1, book_id=7, reason="Similar themes to your recent reads", predicted_rating=4.5, rank=3),
            Recommendation(user_id=1, book_id=11, reason="Popular among readers with your taste", predicted_rating=4.5, rank=4),
            Recommendation(user_id=1, book_id=3, reason="Historical fiction you might enjoy", predicted_rating=4.6, rank=5),
            Recommendation(user_id=1, book_id=5, reason="Trending in thriller category", predicted_rating=4.3, rank=6),
        ]
    )

    db.add_all(
        [
            ReadingListItem(user_id=1, book_id=1, status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=3, status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=5, status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=7, status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=9, status=ReadingStatusEnum.completed),
            ReadingListItem(user_id=1, book_id=11, status=ReadingStatusEnum.completed),
        ]
    )

    db.add_all(
        [
            UserRating(user_id=1, book_id=2, stars=5),
            UserRating(user_id=1, book_id=8, stars=5),
            UserRating(user_id=1, book_id=6, stars=4),
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
            AnalyticsPopularBook(title="Project Hail Mary", reads=342),
            AnalyticsPopularBook(title="Educated", reads=298),
            AnalyticsPopularBook(title="Atomic Habits", reads=276),
            AnalyticsPopularBook(title="The Midnight Library", reads=265),
            AnalyticsPopularBook(title="Dune", reads=234),
        ]
    )

    db.add_all(
        [
            AnalyticsTopRatedBook(title="Project Hail Mary", ratings_count=487, avg_rating=4.8),
            AnalyticsTopRatedBook(title="Educated", ratings_count=445, avg_rating=4.7),
            AnalyticsTopRatedBook(title="Atomic Habits", ratings_count=423, avg_rating=4.7),
            AnalyticsTopRatedBook(title="The Song of Achilles", ratings_count=398, avg_rating=4.6),
            AnalyticsTopRatedBook(title="Dune", ratings_count=376, avg_rating=4.6),
            AnalyticsTopRatedBook(title="The Seven Husbands...", ratings_count=354, avg_rating=4.6),
            AnalyticsTopRatedBook(title="The Psychology of Money", ratings_count=332, avg_rating=4.6),
            AnalyticsTopRatedBook(title="Circe", ratings_count=312, avg_rating=4.5),
            AnalyticsTopRatedBook(title="The Midnight Library", ratings_count=298, avg_rating=4.5),
            AnalyticsTopRatedBook(title="The Invisible Life...", ratings_count=276, avg_rating=4.5),
        ]
    )

    db.commit()
