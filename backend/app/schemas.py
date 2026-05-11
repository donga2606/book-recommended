from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.db.models import JobStatusEnum, ReadingStatusEnum, RoleEnum


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4)


class BookBase(BaseModel):
    title: str
    author: str
    genre: str
    rating: float = Field(ge=0, le=5)
    cover_url: str
    description: str
    year_published: int
    page_count: int
    isbn: str


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    genre: str | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    cover_url: str | None = None
    description: str | None = None
    year_published: int | None = None
    page_count: int | None = None
    isbn: str | None = None


class BookOut(BookBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PaginatedBooks(BaseModel):
    items: list[BookOut]
    total: int
    page: int
    page_size: int


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    avatar: str | None = None
    role: RoleEnum
    preferences: list[str]
    reading_history: list[int]

    model_config = ConfigDict(from_attributes=True)


class UserPatch(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    preferences: list[str] | None = None
    avatar: str | None = None


class RecommendationItem(BaseModel):
    book: BookOut
    reason: str
    predicted_rating: float | None = None
    rank: int


class RecommendationList(BaseModel):
    items: list[RecommendationItem]


class UserRatingUpsert(BaseModel):
    stars: int = Field(ge=1, le=5)


class UserRatingOut(BaseModel):
    book_id: int
    stars: int
    updated_at: datetime


class ReadingListCreate(BaseModel):
    book_id: int
    status: ReadingStatusEnum = ReadingStatusEnum.planned


class ReadingListPatch(BaseModel):
    status: ReadingStatusEnum


class ReadingListOut(BaseModel):
    book_id: int
    status: ReadingStatusEnum
    created_at: datetime
    updated_at: datetime


class TopRatedBookOut(BaseModel):
    title: str
    ratings_count: int
    avg_rating: float


class ModelOverviewOut(BaseModel):
    model_type: str
    input_features: list[str]
    technique: str
    description: str


class ModelExperimentOut(BaseModel):
    id: int
    version: str
    factors: int
    rmse: float
    status: str
    date: str

    model_config = ConfigDict(from_attributes=True)


class ModelMetricsOut(BaseModel):
    train_rmse: float
    test_rmse: float
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    last_trained: str
    training_duration: str

    model_config = ConfigDict(from_attributes=True)


class ModelJobOut(BaseModel):
    id: int
    status: JobStatusEnum
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SVDHyperparametersIn(BaseModel):
    factors: int = Field(default=100, ge=10, le=300)
    epochs: int = Field(default=15, ge=1, le=100)
    learning_rate: float = Field(default=0.01, gt=0, le=1.0)
    regularization: float = Field(default=0.05, ge=0, le=1.0)


class SVDTuningSpaceIn(BaseModel):
    factors: list[int] = Field(default_factory=lambda: [50, 100, 150])
    learning_rates: list[float] = Field(default_factory=lambda: [0.005, 0.01, 0.02])
    regularizations: list[float] = Field(default_factory=lambda: [0.02, 0.05, 0.1])
    epochs: list[int] = Field(default_factory=lambda: [10, 15])


class SVDTrainingRequest(BaseModel):
    max_ratings: int = Field(default=60000, ge=1000, le=400000)
    test_ratio: float = Field(default=0.2, gt=0.05, lt=0.5)
    random_seed: int = Field(default=42, ge=1, le=1_000_000)
    min_user_ratings: int = Field(default=2, ge=1, le=50)
    min_book_ratings: int = Field(default=2, ge=1, le=50)
    hyperparameters: SVDHyperparametersIn = Field(default_factory=SVDHyperparametersIn)
    enable_tuning: bool = False
    max_trials: int = Field(default=12, ge=1, le=100)
    tuning_space: SVDTuningSpaceIn = Field(default_factory=SVDTuningSpaceIn)


class SVDTrainingResult(BaseModel):
    model_type: str
    selected_hyperparameters: SVDHyperparametersIn
    train_rmse: float
    test_rmse: float
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    training_duration_seconds: float
    ratings_used: int
    users_used: int
    books_used: int
    trials_run: int


class SVDTrainingResponse(BaseModel):
    job: ModelJobOut
    result: SVDTrainingResult


class UserActivityOut(BaseModel):
    month: str
    users: int
    active_readers: int

    model_config = ConfigDict(from_attributes=True)


class PopularBookOut(BaseModel):
    title: str
    reads: int

    model_config = ConfigDict(from_attributes=True)


class ProductKpisOut(BaseModel):
    engagement_rate: float
    avg_session_minutes: float
    click_through_rate: float
