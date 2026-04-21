"""
Generate a 2000-row synthetic dataset for disk scheduling algorithm classification.

For each sample we:
  1. Generate a random request queue + head position
  2. Run all 4 algorithms (FCFS, SSTF, SCAN, LOOK)
  3. The algorithm with minimum total_movement becomes the label
  4. Extract 9 numerical features describing the workload
"""

import os
import sys
import random
import numpy as np
import pandas as pd

# Make `backend/` importable when this script is run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from algorithms import fcfs, sstf, scan, look

DISK_SIZE = 200
N_SAMPLES = 2000
RANDOM_SEED = 42

FEATURE_COLUMNS = [
    "num_requests",
    "avg_request",
    "max_request",
    "min_request",
    "avg_distance",
    "left_requests",
    "right_requests",
    "variance",
    "sequentiality",
]


def extract_features(requests: list, head: int) -> dict:
    """Compute the 9 numerical features used by the ML model."""
    arr = np.array(requests)
    distances = np.abs(arr - head)
    sorted_requests = np.sort(arr)
    diffs = np.abs(np.diff(sorted_requests)) if len(sorted_requests) > 1 else np.array([0])

    return {
        "num_requests":   int(len(requests)),
        "avg_request":    float(arr.mean()),
        "max_request":    int(arr.max()),
        "min_request":    int(arr.min()),
        "avg_distance":   float(distances.mean()),
        "left_requests":  int((arr < head).sum()),
        "right_requests": int((arr > head).sum()),
        "variance":       float(arr.var()),
        "sequentiality":  float(diffs.mean()),
    }


def best_algorithm(requests: list, head: int) -> str:
    """Run all 4 algorithms and return the name of the one with min movement."""
    results = {
        "FCFS": fcfs(requests, head)["total_movement"],
        "SSTF": sstf(requests, head)["total_movement"],
        "SCAN": scan(requests, head, DISK_SIZE, "right")["total_movement"],
        "LOOK": look(requests, head, "right")["total_movement"],
    }
    return min(results, key=results.get)


def generate(n_samples: int = N_SAMPLES, seed: int = RANDOM_SEED) -> pd.DataFrame:
    random.seed(seed)
    np.random.seed(seed)

    rows = []
    for _ in range(n_samples):
        n_requests = random.randint(5, 20)
        requests   = [random.randint(0, DISK_SIZE - 1) for _ in range(n_requests)]
        head       = random.randint(0, DISK_SIZE - 1)

        features = extract_features(requests, head)
        features["best_algorithm"] = best_algorithm(requests, head)
        rows.append(features)

    return pd.DataFrame(rows, columns=FEATURE_COLUMNS + ["best_algorithm"])


def main():
    print(f"Generating {N_SAMPLES} synthetic samples...")
    df = generate()

    out_path = os.path.join(os.path.dirname(__file__), "disk_dataset.csv")
    df.to_csv(out_path, index=False)

    print(f"Dataset saved to: {out_path}")
    print(f"Shape: {df.shape}")
    print("\nLabel distribution:")
    print(df["best_algorithm"].value_counts())


if __name__ == "__main__":
    main()
