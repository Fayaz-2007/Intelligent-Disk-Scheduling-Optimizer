"""
FastAPI backend for the Intelligent Disk Scheduling Optimizer.

Endpoints:
  POST /run-all    Run all 4 algorithms on a request queue.
  POST /predict    ML prediction of the best algorithm.
  POST /save       Persist a result to Supabase.
  GET  /history    Retrieve the last 20 results from Supabase.
  GET  /health     Liveness probe.

Run locally:
  cd backend && uvicorn main:app --reload
"""

import os
from typing import List, Optional

import joblib
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from algorithms import fcfs, sstf, scan, look

# ── Environment ─────────────────────────────────────────────────────────────
# .env sits ONE level above backend/ (at project root)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Supabase client is optional — only instantiate when creds are provided
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:  # noqa: BLE001
        print(f"[warn] Failed to initialise Supabase client: {e}")

# ── ML artefacts ────────────────────────────────────────────────────────────
ML_DIR       = os.path.join(os.path.dirname(__file__), "ml")
MODEL_PATH   = os.path.join(ML_DIR, "model.pkl")
ENCODER_PATH = os.path.join(ML_DIR, "label_encoder.pkl")

model = None
label_encoder = None


def _load_model_artifacts():
    """Load the trained model + label encoder. Prints a warning if missing."""
    global model, label_encoder
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        print(f"[info] Loaded model: {MODEL_PATH}")
    else:
        print(
            "[warn] model.pkl or label_encoder.pkl not found. "
            "Run:\n"
            "  python ml/generate_dataset.py\n"
            "  python ml/train_model.py"
        )


# ── FastAPI app ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Intelligent Disk Scheduling Optimizer",
    version="1.0.0",
    description="FastAPI backend that runs classical disk-scheduling algorithms "
                "and an ML classifier to recommend the optimal algorithm.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    _load_model_artifacts()


# ── Request / response models ───────────────────────────────────────────────
class DiskInput(BaseModel):
    requests:  List[int]
    head:      int
    disk_size: int = Field(default=200)
    direction: str = Field(default="right")


class SaveInput(BaseModel):
    requests:             List[int]
    head_position:        int
    predicted_algorithm:  str
    best_algorithm:       str
    seek_times:           dict


# ── Helpers ─────────────────────────────────────────────────────────────────
def extract_features(requests: List[int], head: int) -> List[float]:
    """Return the 9 features the ML model expects, in the exact training order."""
    if not requests:
        return [0, 0.0, 0, 0, 0.0, 0, 0, 0.0, 0.0]

    arr = np.array(requests)
    distances = np.abs(arr - head)
    sorted_requests = np.sort(arr)
    diffs = np.abs(np.diff(sorted_requests)) if len(sorted_requests) > 1 else np.array([0])

    return [
        int(len(requests)),
        float(arr.mean()),
        int(arr.max()),
        int(arr.min()),
        float(distances.mean()),
        int((arr < head).sum()),
        int((arr > head).sum()),
        float(arr.var()),
        float(diffs.mean()),
    ]


# ── Endpoints ───────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/run-all")
def run_all(payload: DiskInput):
    """Run all 4 algorithms and return each result plus the best."""
    r, h = payload.requests, payload.head
    ds   = payload.disk_size
    dirn = payload.direction

    results = {
        "fcfs": fcfs(r, h),
        "sstf": sstf(r, h),
        "scan": scan(r, h, ds, dirn),
        "look": look(r, h, dirn),
    }

    best_name = min(results, key=lambda k: results[k]["total_movement"])

    return {
        **results,
        "best_algorithm": best_name.upper(),
        "best_movement":  results[best_name]["total_movement"],
    }


@app.post("/predict")
def predict(payload: DiskInput):
    """Predict the best algorithm using the trained RandomForest model."""
    if model is None or label_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Generate the dataset and train the model first."
        )

    features = extract_features(payload.requests, payload.head)
    pred_idx = model.predict([features])[0]
    pred_algo = label_encoder.inverse_transform([pred_idx])[0]

    return {
        "predicted_algorithm": pred_algo,
        "features_used": {
            "num_requests":   features[0],
            "avg_distance":   round(features[4], 2),
            "left_requests":  features[5],
            "right_requests": features[6],
            "variance":       round(features[7], 2),
            "sequentiality":  round(features[8], 2),
        },
    }


@app.post("/save")
def save(payload: SaveInput):
    """Persist a run to Supabase."""
    if supabase is None:
        raise HTTPException(
            status_code=503,
            detail="Supabase not configured. Set SUPABASE_URL / SUPABASE_KEY in .env."
        )

    try:
        row = {
            "requests":            payload.requests,
            "head_position":       payload.head_position,
            "predicted_algorithm": payload.predicted_algorithm,
            "best_algorithm":      payload.best_algorithm,
            "seek_times":          payload.seek_times,
        }
        res = supabase.table("results").insert(row).execute()

        inserted_id = None
        if getattr(res, "data", None):
            inserted_id = res.data[0].get("id")

        return {"message": "Saved successfully", "id": inserted_id}
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Supabase save failed: {e}")


@app.get("/history")
def history():
    """Return the last 20 records from Supabase, newest first."""
    if supabase is None:
        raise HTTPException(
            status_code=503,
            detail="Supabase not configured. Set SUPABASE_URL / SUPABASE_KEY in .env."
        )

    try:
        res = (
            supabase.table("results")
            .select("*")
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        return res.data or []
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Supabase fetch failed: {e}")
