from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.models import JobStatusEnum, ModelExperiment, ModelJob, ModelMetrics, RoleEnum, User
from app.db.session import get_db
from app.schemas import ModelExperimentOut, ModelJobOut, ModelMetricsOut, ModelOverviewOut

router = APIRouter(
    prefix="/ml",
    tags=["ml"],
    dependencies=[Depends(require_role(RoleEnum.data_scientist))],
)


@router.get("/overview", response_model=ModelOverviewOut)
def model_overview(_: User = Depends(require_role(RoleEnum.data_scientist))) -> ModelOverviewOut:
    return ModelOverviewOut(
        model_type="SVD (Singular Value Decomposition)",
        input_features=["User ID", "Book ID", "Rating"],
        technique="Matrix Factorization",
        description=(
            "Collaborative filtering model using matrix factorization to predict "
            "user ratings based on historical interactions."
        ),
    )


@router.get("/experiments", response_model=list[ModelExperimentOut])
def list_experiments(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> list[ModelExperimentOut]:
    rows = db.scalars(select(ModelExperiment).order_by(desc(ModelExperiment.id))).all()
    return [ModelExperimentOut.model_validate(row) for row in rows]


@router.get("/metrics", response_model=ModelMetricsOut)
def get_metrics(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> ModelMetricsOut:
    row = db.scalar(select(ModelMetrics).order_by(desc(ModelMetrics.id)))
    if row is None:
        raise HTTPException(status_code=404, detail="Model metrics not found")
    return ModelMetricsOut.model_validate(row)


@router.post("/retrain", response_model=ModelJobOut, status_code=status.HTTP_202_ACCEPTED)
def retrain_model(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> ModelJobOut:
    job = ModelJob(status=JobStatusEnum.queued, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
    db.add(job)
    db.commit()
    db.refresh(job)
    return ModelJobOut.model_validate(job)


@router.get("/jobs/{job_id}", response_model=ModelJobOut)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> ModelJobOut:
    row = db.get(ModelJob, job_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return ModelJobOut.model_validate(row)
