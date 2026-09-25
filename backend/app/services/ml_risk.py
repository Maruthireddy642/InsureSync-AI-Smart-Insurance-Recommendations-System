import os

import joblib
import numpy as np

from app.ml.train_risk_model import MODEL_DIR, models_exist, train_and_save

_MODELS = {}


def _ensure_models_loaded():
    if not models_exist():
        train_and_save()
    if not _MODELS:
        for name in ("diabetes", "hypertension", "heart_disease"):
            _MODELS[name] = joblib.load(os.path.join(MODEL_DIR, f"{name}.joblib"))


def predict_risks(age: int, bmi: float, systolic_bp: int, glucose_level: float, smoker: bool, family_history: bool) -> dict:
    _ensure_models_loaded()
    X = np.array([[age, bmi, systolic_bp, glucose_level, int(smoker), int(family_history)]])

    diabetes_risk = float(_MODELS["diabetes"].predict_proba(X)[0][1])
    hypertension_risk = float(_MODELS["hypertension"].predict_proba(X)[0][1])
    heart_disease_risk = float(_MODELS["heart_disease"].predict_proba(X)[0][1])

    return {
        "diabetes_risk": round(diabetes_risk, 4),
        "hypertension_risk": round(hypertension_risk, 4),
        "heart_disease_risk": round(heart_disease_risk, 4),
    }
