from __future__ import annotations

import csv
import math
import random
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np


@dataclass
class SVDHyperParams:
    factors: int = 50
    epochs: int = 15
    learning_rate: float = 0.01
    regularization: float = 0.05


@dataclass
class SVDTrainingConfig:
    max_ratings: int = 60000
    test_ratio: float = 0.2
    random_seed: int = 42
    min_user_ratings: int = 2
    min_book_ratings: int = 2


@dataclass
class SVDEvaluation:
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


def load_ratings_from_csv(
    ratings_csv_path: Path,
    max_ratings: int,
    min_user_ratings: int,
    min_book_ratings: int,
    random_seed: int,
) -> list[tuple[int, str, float]]:
    if not ratings_csv_path.exists():
        raise FileNotFoundError(f"Ratings dataset not found: {ratings_csv_path}")

    ratings: list[tuple[int, str, float]] = []
    user_counts: dict[int, int] = {}
    book_counts: dict[str, int] = {}

    with ratings_csv_path.open("r", encoding="latin-1", newline="") as handle:
        reader = csv.reader(handle, delimiter=";", quotechar='"')
        for row in reader:
            if len(row) < 3:
                continue
            try:
                user_id = int(row[0].strip().strip('"'))
                isbn = row[1].strip().strip('"')
                raw_rating = int(row[2].strip().strip('"'))
            except ValueError:
                continue

            # 0 indicates implicit feedback in Book-Crossing.
            if raw_rating <= 0 or not isbn:
                continue

            rating = min(5.0, raw_rating / 2.0)
            ratings.append((user_id, isbn, float(rating)))
            user_counts[user_id] = user_counts.get(user_id, 0) + 1
            book_counts[isbn] = book_counts.get(isbn, 0) + 1

    filtered = [
        item
        for item in ratings
        if user_counts.get(item[0], 0) >= min_user_ratings
        and book_counts.get(item[1], 0) >= min_book_ratings
    ]
    if not filtered:
        raise ValueError("No explicit ratings left after filtering.")

    rng = random.Random(random_seed)
    if len(filtered) > max_ratings:
        filtered = rng.sample(filtered, k=max_ratings)
    rng.shuffle(filtered)
    return filtered


def split_train_test(
    ratings: list[tuple[int, str, float]],
    test_ratio: float,
) -> tuple[list[tuple[int, str, float]], list[tuple[int, str, float]]]:
    test_size = max(1, int(len(ratings) * test_ratio))
    test = ratings[:test_size]
    train = ratings[test_size:]
    if not train:
        raise ValueError("Train set is empty. Reduce test_ratio or increase max_ratings.")
    return train, test


def _build_indices(
    ratings: list[tuple[int, str, float]],
) -> tuple[dict[int, int], dict[str, int]]:
    user_index: dict[int, int] = {}
    item_index: dict[str, int] = {}
    for user_id, isbn, _ in ratings:
        if user_id not in user_index:
            user_index[user_id] = len(user_index)
        if isbn not in item_index:
            item_index[isbn] = len(item_index)
    return user_index, item_index


def _predict(
    user_id: int,
    isbn: str,
    global_mean: float,
    user_bias: np.ndarray,
    item_bias: np.ndarray,
    user_factors: np.ndarray,
    item_factors: np.ndarray,
    user_index: dict[int, int],
    item_index: dict[str, int],
) -> float:
    baseline = global_mean
    user_idx = user_index.get(user_id)
    item_idx = item_index.get(isbn)
    if user_idx is not None:
        baseline += float(user_bias[user_idx])
    if item_idx is not None:
        baseline += float(item_bias[item_idx])
    if user_idx is not None and item_idx is not None:
        baseline += float(np.dot(user_factors[user_idx], item_factors[item_idx]))
    return float(np.clip(baseline, 0.0, 5.0))


def _rmse(
    ratings: list[tuple[int, str, float]],
    global_mean: float,
    user_bias: np.ndarray,
    item_bias: np.ndarray,
    user_factors: np.ndarray,
    item_factors: np.ndarray,
    user_index: dict[int, int],
    item_index: dict[str, int],
) -> float:
    squared = 0.0
    for user_id, isbn, rating in ratings:
        pred = _predict(
            user_id,
            isbn,
            global_mean,
            user_bias,
            item_bias,
            user_factors,
            item_factors,
            user_index,
            item_index,
        )
        diff = rating - pred
        squared += diff * diff
    return math.sqrt(squared / max(len(ratings), 1))


def _binary_metrics(
    ratings: list[tuple[int, str, float]],
    global_mean: float,
    user_bias: np.ndarray,
    item_bias: np.ndarray,
    user_factors: np.ndarray,
    item_factors: np.ndarray,
    user_index: dict[int, int],
    item_index: dict[str, int],
    threshold: float = 3.5,
) -> tuple[float, float, float, float]:
    tp = fp = tn = fn = 0
    for user_id, isbn, rating in ratings:
        pred = _predict(
            user_id,
            isbn,
            global_mean,
            user_bias,
            item_bias,
            user_factors,
            item_factors,
            user_index,
            item_index,
        )
        pred_pos = pred >= threshold
        true_pos = rating >= threshold
        if pred_pos and true_pos:
            tp += 1
        elif pred_pos and not true_pos:
            fp += 1
        elif not pred_pos and true_pos:
            fn += 1
        else:
            tn += 1

    total = tp + fp + tn + fn
    accuracy = (tp + tn) / total if total else 0.0
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1_score = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0
    return accuracy * 100.0, precision * 100.0, recall * 100.0, f1_score * 100.0


def train_and_evaluate_svd(
    ratings: list[tuple[int, str, float]],
    params: SVDHyperParams,
    config: SVDTrainingConfig,
) -> SVDEvaluation:
    train, test = split_train_test(ratings, test_ratio=config.test_ratio)
    user_index, item_index = _build_indices(train)
    if not user_index or not item_index:
        raise ValueError("Insufficient train data after preprocessing.")

    rng = np.random.default_rng(config.random_seed)
    n_users = len(user_index)
    n_items = len(item_index)
    factors = max(params.factors, 1)

    user_factors = rng.normal(0, 0.1, size=(n_users, factors))
    item_factors = rng.normal(0, 0.1, size=(n_items, factors))
    user_bias = np.zeros(n_users, dtype=np.float64)
    item_bias = np.zeros(n_items, dtype=np.float64)
    global_mean = float(np.mean([rating for _, _, rating in train]))

    indexed_train = [
        (user_index[user_id], item_index[isbn], rating)
        for user_id, isbn, rating in train
        if user_id in user_index and isbn in item_index
    ]
    if not indexed_train:
        raise ValueError("No ratings available for model training.")

    start = time.perf_counter()
    lr = params.learning_rate
    reg = params.regularization
    order = np.arange(len(indexed_train))

    for _ in range(max(params.epochs, 1)):
        rng.shuffle(order)
        for idx in order:
            user_idx, item_idx, actual = indexed_train[int(idx)]
            pred = global_mean + user_bias[user_idx] + item_bias[item_idx] + np.dot(
                user_factors[user_idx], item_factors[item_idx]
            )
            err = actual - pred

            user_bias[user_idx] += lr * (err - reg * user_bias[user_idx])
            item_bias[item_idx] += lr * (err - reg * item_bias[item_idx])

            pu = user_factors[user_idx].copy()
            qi = item_factors[item_idx].copy()
            user_factors[user_idx] += lr * (err * qi - reg * pu)
            item_factors[item_idx] += lr * (err * pu - reg * qi)

    duration = time.perf_counter() - start
    train_rmse = _rmse(
        train,
        global_mean,
        user_bias,
        item_bias,
        user_factors,
        item_factors,
        user_index,
        item_index,
    )
    test_rmse = _rmse(
        test,
        global_mean,
        user_bias,
        item_bias,
        user_factors,
        item_factors,
        user_index,
        item_index,
    )
    accuracy, precision, recall, f1_score = _binary_metrics(
        test,
        global_mean,
        user_bias,
        item_bias,
        user_factors,
        item_factors,
        user_index,
        item_index,
    )

    return SVDEvaluation(
        train_rmse=round(train_rmse, 4),
        test_rmse=round(test_rmse, 4),
        accuracy=round(accuracy, 2),
        precision=round(precision, 2),
        recall=round(recall, 2),
        f1_score=round(f1_score, 2),
        training_duration_seconds=duration,
        ratings_used=len(ratings),
        users_used=len(user_index),
        books_used=len(item_index),
    )
