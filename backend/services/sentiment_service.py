from __future__ import annotations

from functools import lru_cache
from typing import List

POSITIVE_WORDS = {
    "thanks", "thank", "helpful", "best", "good", "great", "awesome", "excellent", "love",
    "nice", "amazing", "clear", "samajh", "mast", "badhiya", "super", "perfect",
}
NEGATIVE_WORDS = {
    "bad", "worst", "confuse", "confused", "problem", "issue", "wrong", "not", "nahi",
    "nhi", "stuck", "doubt", "difficult", "hard", "complaint", "waste", "poor",
}


@lru_cache(maxsize=1)
def _sentiment_pipeline():
    try:
        from transformers import pipeline

        return pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-xlm-roberta-base-sentiment",
            truncation=True,
        )
    except Exception:
        return None


def rule_sentiment(text: str) -> str:
    lowered = f" {str(text).lower()} "
    positive = sum(1 for word in POSITIVE_WORDS if word in lowered)
    negative = sum(1 for word in NEGATIVE_WORDS if word in lowered)
    if negative > positive:
        return "Negative"
    if positive > negative:
        return "Positive"
    return "Neutral"


def analyze_sentiment(texts: List[str]) -> List[str]:
    model = _sentiment_pipeline()
    if model is None:
        return [rule_sentiment(text) for text in texts]

    labels = []
    try:
        for result in model(texts, batch_size=32):
            raw_label = str(result.get("label", "")).lower()
            if "negative" in raw_label or raw_label == "label_0":
                labels.append("Negative")
            elif "positive" in raw_label or raw_label == "label_2":
                labels.append("Positive")
            else:
                labels.append("Neutral")
        return labels
    except Exception:
        return [rule_sentiment(text) for text in texts]

