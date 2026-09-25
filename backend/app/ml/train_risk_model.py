"""
Generates a synthetic-but-medically-plausible training set and fits three
lightweight classifiers (diabetes, hypertension, heart disease risk) used by
the health risk stratification step of the Insurance Advisory System.

In a production deployment these would be swapped for models trained on
real, de-identified clinical datasets. The synthetic generator here exists so
the project is fully runnable/demoable out of the box with no external data
dependency.
"""
import os

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression

MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURES = ["age", "bmi", "systolic_bp", "glucose_level", "smoker", "family_history"]


def _synthetic_dataset(n: int = 4000, seed: int = 42):
    rng = np.random.default_rng(seed)
    age = rng.integers(18, 80, n)
    bmi = rng.normal(26, 5, n).clip(15, 50)
    systolic_bp = rng.normal(120, 15, n).clip(90, 200)
    glucose = rng.normal(100, 25, n).clip(60, 300)
    smoker = rng.integers(0, 2, n)
    family_history = rng.integers(0, 2, n)

    X = np.column_stack([age, bmi, systolic_bp, glucose, smoker, family_history])

    # Rule-informed synthetic labels with noise, mimicking real risk drivers
    diabetes_logit = (
        0.04 * (age - 40) + 0.12 * (bmi - 25) + 0.05 * (glucose - 100) + 0.5 * family_history - 3
    )
    hypertension_logit = 0.05 * (age - 40) + 0.08 * (bmi - 25) + 0.06 * (systolic_bp - 120) + 0.3 * smoker - 3
    heart_logit = (
        0.05 * (age - 40) + 0.07 * (bmi - 25) + 0.04 * (systolic_bp - 120) + 0.6 * smoker + 0.4 * family_history - 3.5
    )

    def to_labels(logit):
        prob = 1 / (1 + np.exp(-logit))
        return (rng.random(n) < prob).astype(int)

    y_diabetes = to_labels(diabetes_logit)
    y_hyper = to_labels(hypertension_logit)
    y_heart = to_labels(heart_logit)

    return X, y_diabetes, y_hyper, y_heart


def train_and_save() -> None:
    X, y_d, y_h, y_c = _synthetic_dataset()

    models = {
        "diabetes": LogisticRegression(max_iter=1000).fit(X, y_d),
        "hypertension": LogisticRegression(max_iter=1000).fit(X, y_h),
        "heart_disease": LogisticRegression(max_iter=1000).fit(X, y_c),
    }
    for name, model in models.items():
        joblib.dump(model, os.path.join(MODEL_DIR, f"{name}.joblib"))


def models_exist() -> bool:
    return all(
        os.path.exists(os.path.join(MODEL_DIR, f"{name}.joblib"))
        for name in ("diabetes", "hypertension", "heart_disease")
    )


if __name__ == "__main__":
    train_and_save()
    print("Risk models trained and saved to", MODEL_DIR)
