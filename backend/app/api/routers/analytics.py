from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.models import AnalyticsPopularBook, AnalyticsUserActivity, RoleEnum, User
from app.db.session import get_db
from app.schemas import PopularBookOut, ProductKpisOut, UserActivityOut

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    dependencies=[Depends(require_role(RoleEnum.data_scientist))],
)


@router.get("/user-activity", response_model=list[UserActivityOut])
def get_user_activity(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> list[UserActivityOut]:
    rows = db.scalars(select(AnalyticsUserActivity).order_by(AnalyticsUserActivity.id.asc())).all()
    return [UserActivityOut.model_validate(row) for row in rows]


@router.get("/popular-books", response_model=list[PopularBookOut])
def get_popular_books(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> list[PopularBookOut]:
    rows = db.scalars(select(AnalyticsPopularBook).order_by(desc(AnalyticsPopularBook.reads))).all()
    return [PopularBookOut.model_validate(row) for row in rows]


@router.get("/product-kpis", response_model=ProductKpisOut)
def get_product_kpis(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> ProductKpisOut:
    rows = db.scalars(select(AnalyticsUserActivity).order_by(AnalyticsUserActivity.id.asc())).all()
    if not rows:
        return ProductKpisOut(engagement_rate=0.0, avg_session_minutes=0.0, click_through_rate=0.0)
    latest = rows[-1]
    engagement_rate = round((latest.active_readers / max(latest.users, 1)) * 100, 1)
    return ProductKpisOut(
        engagement_rate=engagement_rate,
        avg_session_minutes=24.0,
        click_through_rate=42.1,
    )
