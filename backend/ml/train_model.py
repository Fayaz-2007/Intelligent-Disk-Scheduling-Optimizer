"""
Train a Random Forest Classifier on the synthetic disk-scheduling dataset
and persist both the model and the label encoder to disk via joblib.
"""

import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

ML_DIR      = os.path.dirname(__file__)
DATASET_CSV = os.path.join(ML_DIR, "disk_dataset.csv")
MODEL_PATH  = os.path.join(ML_DIR, "model.pkl")
ENCODER_PATH = os.path.join(ML_DIR, "label_encoder.pkl")


def main():
    if not os.path.exists(DATASET_CSV):
        raise FileNotFoundError(
            f"Dataset not found at {DATASET_CSV}. "
            "Run `python ml/generate_dataset.py` first."
        )

    df = pd.read_csv(DATASET_CSV)
    print(f"Loaded dataset: {df.shape}")

    X = df.drop(columns=["best_algorithm"])
    y = df["best_algorithm"]

    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)
    print(f"Classes: {list(encoder.classes_)}")

    # Stratify only if every class has >= 2 samples; otherwise skip to avoid
    # sklearn's "least populated class has only 1 member" error.
    class_counts = pd.Series(y_encoded).value_counts()
    stratify_arg = y_encoded if class_counts.min() >= 2 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=stratify_arg
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\nTest accuracy: {accuracy * 100:.2f}%")
    print("\nClassification report:")
    print(classification_report(
        y_test, y_pred,
        labels=list(range(len(encoder.classes_))),
        target_names=encoder.classes_,
        zero_division=0,
    ))

    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoder, ENCODER_PATH)

    print(f"\nModel saved to:          {MODEL_PATH}")
    print(f"Label encoder saved to:  {ENCODER_PATH}")


if __name__ == "__main__":
    main()
