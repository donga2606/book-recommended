from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SQLEnum, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class RoleEnum(str, Enum):
    user = "user"
    admin = "admin"
    data_scientist = "data_scientist"


class ReadingStatusEnum(str, Enum):
    planned = "planned"
    reading = "reading"
    completed = "completed"


class JobStatusEnum(str, Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    avatar: Mapped[str | None] = mapped_column(String(512), nullable=True)
    role: Mapped[RoleEnum] = mapped_column(SQLEnum(RoleEnum), default=RoleEnum.user, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    preferences: Mapped[str] = mapped_column(Text, default="", nullable=False)


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    author: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    genre: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    cover_url: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    year_published: Mapped[int] = mapped_column(Integer, nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, nullable=False)
    isbn: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)


class UserRating(Base):
    __tablename__ = "user_ratings"
    __table_args__ = (UniqueConstraint("user_id", "book_id", name="uq_user_book_rating"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"), nullable=False, index=True)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class ReadingListItem(Base):
    __tablename__ = "reading_list_items"
    __table_args__ = (UniqueConstraint("user_id", "book_id", name="uq_user_book_reading_item"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"), nullable=False, index=True)
    status: Mapped[ReadingStatusEnum] = mapped_column(SQLEnum(ReadingStatusEnum), default=ReadingStatusEnum.planned, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Recommendation(Base):
    __tablename__ = "recommendations"
    __table_args__ = (UniqueConstraint("user_id", "book_id", name="uq_user_book_recommendation"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"), nullable=False, index=True)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    predicted_rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    rank: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class ModelExperiment(Base):
    __tablename__ = "model_experiments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version: Mapped[str] = mapped_column(String(120), nullable=False)
    factors: Mapped[int] = mapped_column(Integer, nullable=False)
    rmse: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="archived", nullable=False)
    date: Mapped[str] = mapped_column(String(32), nullable=False)


class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    train_rmse: Mapped[float] = mapped_column(Float, nullable=False)
    test_rmse: Mapped[float] = mapped_column(Float, nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)
    precision: Mapped[float] = mapped_column(Float, nullable=False)
    recall: Mapped[float] = mapped_column(Float, nullable=False)
    f1_score: Mapped[float] = mapped_column(Float, nullable=False)
    last_trained: Mapped[str] = mapped_column(String(64), nullable=False)
    training_duration: Mapped[str] = mapped_column(String(32), nullable=False)


class AnalyticsUserActivity(Base):
    __tablename__ = "analytics_user_activity"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    month: Mapped[str] = mapped_column(String(12), nullable=False)
    users: Mapped[int] = mapped_column(Integer, nullable=False)
    active_readers: Mapped[int] = mapped_column(Integer, nullable=False)


class AnalyticsPopularBook(Base):
    __tablename__ = "analytics_popular_books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    reads: Mapped[int] = mapped_column(Integer, nullable=False)


class AnalyticsTopRatedBook(Base):
    __tablename__ = "analytics_top_rated_books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    ratings_count: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_rating: Mapped[float] = mapped_column(Float, nullable=False)


class ModelJob(Base):
    __tablename__ = "model_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    status: Mapped[JobStatusEnum] = mapped_column(SQLEnum(JobStatusEnum), default=JobStatusEnum.queued, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
