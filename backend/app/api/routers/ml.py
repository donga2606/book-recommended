from datetime import datetime
from itertools import product
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select, update
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.models import JobStatusEnum, ModelExperiment, ModelJob, ModelMetrics, RoleEnum, User
from app.db.session import get_db
from app.ml.svd import (
    SVDHyperParams,
    SVDTrainingConfig,
    SVDEvaluation,
    load_ratings_from_csv,
    save_model_artifact,
    train_and_evaluate_svd,
)
from app.schemas import (
    ModelExperimentOut,
    ModelJobOut,
    ModelMetricsOut,
    ModelOverviewOut,
    SVDHyperparametersIn,
    SVDTrainingRequest,
    SVDTrainingResponse,
    SVDTrainingResult,
)

router = APIRouter(
    prefix="/ml",
    tags=["ml"],
    dependencies=[Depends(require_role(RoleEnum.data_scientist))],
)
RATINGS_DATASET_PATH = Path(__file__).resolve().parents[3] / "dataset" / "BX-Book-Ratings.csv"
MODEL_ARTIFACT_PATH = Path(__file__).resolve().parents[3] / "dataset" / "svd_model_latest"


def _upsert_metrics(db: Session, metrics: SVDEvaluation) -> None:
    payload = dict(
        train_rmse=metrics.train_rmse,
        test_rmse=metrics.test_rmse,
        accuracy=metrics.accuracy,
        precision=metrics.precision,
        recall=metrics.recall,
        f1_score=metrics.f1_score,
        last_trained=datetime.utcnow().isoformat() + "Z",
        training_duration=f"{metrics.training_duration_seconds:.2f}s",
    )
    row = db.scalar(select(ModelMetrics).order_by(desc(ModelMetrics.id)))
    if row is None:
        db.add(ModelMetrics(**payload))
    else:
        for key, value in payload.items():
            setattr(row, key, value)
        db.add(row)


def _log_experiment(db: Session, params: SVDHyperParams, rmse: float, status_label: str = "active") -> None:
    if status_label == "active":
        # Ensure there is only one active experiment at any time.
        db.execute(
            update(ModelExperiment)
            .where(ModelExperiment.status == "active")
            .values(status="archived")
        )

    db.add(
        ModelExperiment(
            version=(
                f"SVD(f={params.factors}, e={params.epochs}, "
                f"lr={params.learning_rate:.4f}, reg={params.regularization:.4f})"
            ),
            factors=params.factors,
            rmse=rmse,
            status=status_label,
            date=datetime.utcnow().date().isoformat(),
        )
    )


@router.get("/overview", response_model=ModelOverviewOut)
def model_overview(_: User = Depends(require_role(RoleEnum.data_scientist))) -> ModelOverviewOut:
    return ModelOverviewOut(
        model_type="SVD (Singular Value Decomposition)",
        input_features=["User ID", "Book ID", "Rating"],
        technique="Matrix Factorization",
        description=(
            "We train an SVD-based collaborative filtering model on historical user-book ratings. "
            "The model learns latent vectors for users and books, then predicts preference by "
            "computing how strongly those latent factors align (dot-product style scoring). "
            "This captures hidden taste patterns (for example, pacing or writing style) beyond "
            "explicit genres, but requires enough interaction history and is less accurate for "
            "cold-start users/items."
        ),
    )


@router.get("/experiments", response_model=list[ModelExperimentOut])
def list_experiments(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> list[ModelExperimentOut]:
    rows = db.scalars(select(ModelExperiment).order_by(desc(ModelExperiment.id))).all()
    return [ModelExperimentOut.model_validate(row) for row in rows]


@router.post("/experiments/{experiment_id}/activate", response_model=ModelExperimentOut)
def activate_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> ModelExperimentOut:
    target = db.get(ModelExperiment, experiment_id)
    if target is None:
        raise HTTPException(status_code=404, detail="Model experiment not found")

    db.execute(
        update(ModelExperiment)
        .where(ModelExperiment.status == "active")
        .where(ModelExperiment.id != experiment_id)
        .values(status="archived")
    )
    target.status = "active"
    db.add(target)
    db.commit()
    db.refresh(target)
    return ModelExperimentOut.model_validate(target)


@router.delete("/experiments/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> None:
    target = db.get(ModelExperiment, experiment_id)
    if target is None:
        raise HTTPException(status_code=404, detail="Model experiment not found")
    if target.status.lower() == "active":
        raise HTTPException(status_code=400, detail="Active experiment cannot be removed")

    db.delete(target)
    db.commit()


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


@router.post("/train", response_model=SVDTrainingResponse)
def train_svd_model(
    payload: SVDTrainingRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(RoleEnum.data_scientist)),
) -> SVDTrainingResponse:
    job = ModelJob(status=JobStatusEnum.queued, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
    db.add(job)
    db.commit()
    db.refresh(job)

    try:
        job.status = JobStatusEnum.running
        job.updated_at = datetime.utcnow()
        db.add(job)
        db.commit()
        db.refresh(job)

        config = SVDTrainingConfig(
            max_ratings=payload.max_ratings,
            test_ratio=payload.test_ratio,
            random_seed=payload.random_seed,
            min_user_ratings=payload.min_user_ratings,
            min_book_ratings=payload.min_book_ratings,
        )
        ratings = load_ratings_from_csv(
            ratings_csv_path=RATINGS_DATASET_PATH,
            max_ratings=config.max_ratings,
            min_user_ratings=config.min_user_ratings,
            min_book_ratings=config.min_book_ratings,
            random_seed=config.random_seed,
        )
        if len(ratings) < 1000:
            raise ValueError("Not enough ratings to train SVD. Increase max_ratings or relax filters.")

        base = payload.hyperparameters
        selected = SVDHyperParams(
            factors=base.factors,
            epochs=base.epochs,
            learning_rate=base.learning_rate,
            regularization=base.regularization,
        )
        best_metrics = train_and_evaluate_svd(ratings=ratings, params=selected, config=config)
        trials_run = 1

        if payload.enable_tuning:
            combos = product(
                payload.tuning_space.factors,
                payload.tuning_space.epochs,
                payload.tuning_space.learning_rates,
                payload.tuning_space.regularizations,
            )
            for idx, (factors, epochs, learning_rate, regularization) in enumerate(combos, start=1):
                if idx > payload.max_trials:
                    break
                candidate = SVDHyperParams(
                    factors=factors,
                    epochs=epochs,
                    learning_rate=learning_rate,
                    regularization=regularization,
                )
                candidate_metrics = train_and_evaluate_svd(
                    ratings=ratings,
                    params=candidate,
                    config=config,
                )
                trials_run += 1
                _log_experiment(db, candidate, candidate_metrics.test_rmse, status_label="archived")
                if candidate_metrics.test_rmse < best_metrics.test_rmse:
                    selected = candidate
                    best_metrics = candidate_metrics

        _upsert_metrics(db, best_metrics)
        _log_experiment(db, selected, best_metrics.test_rmse, status_label="active")
        save_model_artifact(MODEL_ARTIFACT_PATH, best_metrics.model)

        job.status = JobStatusEnum.completed
        job.updated_at = datetime.utcnow()
        db.add(job)
        db.commit()
        db.refresh(job)

        result = SVDTrainingResult(
            model_type="SVD (Matrix Factorization)",
            selected_hyperparameters=SVDHyperparametersIn(
                factors=selected.factors,
                epochs=selected.epochs,
                learning_rate=selected.learning_rate,
                regularization=selected.regularization,
            ),
            train_rmse=best_metrics.train_rmse,
            test_rmse=best_metrics.test_rmse,
            accuracy=best_metrics.accuracy,
            precision=best_metrics.precision,
            recall=best_metrics.recall,
            f1_score=best_metrics.f1_score,
            training_duration_seconds=round(best_metrics.training_duration_seconds, 2),
            ratings_used=best_metrics.ratings_used,
            users_used=best_metrics.users_used,
            books_used=best_metrics.books_used,
            trials_run=trials_run,
        )
        return SVDTrainingResponse(job=ModelJobOut.model_validate(job), result=result)
    except Exception as exc:
        job.status = JobStatusEnum.failed
        job.updated_at = datetime.utcnow()
        db.add(job)
        db.commit()
        raise HTTPException(status_code=500, detail=f"SVD training failed: {exc}") from exc


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
