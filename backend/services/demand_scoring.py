from __future__ import annotations

from typing import Dict, Optional

import pandas as pd


INTENT_TERMS = {
    "question": ["?", "how", "what", "why", "kaise", "kya", "kab", "which"],
    "request": ["please", "pls", "make", "banao", "banaye", "need", "want", "request", "guide"],
    "pain": ["problem", "stuck", "nahi", "nhi", "confuse", "confused", "doubt", "low score", "issue"],
}


def minmax(value: float, maximum: float) -> float:
    if maximum <= 0:
        return 0.0
    return max(0.0, min(100.0, (value / maximum) * 100.0))


def request_strength(text: str) -> Dict[str, bool]:
    lowered = str(text).lower()
    return {
        "is_question": any(term in lowered for term in INTENT_TERMS["question"]),
        "is_request": any(term in lowered for term in INTENT_TERMS["request"]),
        "is_pain": any(term in lowered for term in INTENT_TERMS["pain"]),
    }


def recent_count(cluster: pd.DataFrame) -> int:
    if cluster.empty or "comment_published_at" not in cluster.columns:
        return 0
    dates = pd.to_datetime(cluster["comment_published_at"], utc=True, errors="coerce")
    if dates.notna().sum() == 0:
        return 0
    latest = dates.max()
    return int((dates >= latest - pd.Timedelta(days=30)).sum())


def audience_demand_score(
    cluster: pd.DataFrame,
    total_comments: int,
    total_videos: int,
    max_likes: float,
    cohesion_score: float,
) -> float:
    comment_count = len(cluster)
    unique_video_count = int(cluster["video_id"].nunique()) if "video_id" in cluster.columns else 1
    intent_flags = cluster["cleaned_comment_text"].apply(request_strength)
    request_count = sum(1 for item in intent_flags if item["is_question"] or item["is_request"] or item["is_pain"])
    total_likes = float(pd.to_numeric(cluster.get("comment_likes", 0), errors="coerce").fillna(0).sum())
    recency = recent_count(cluster)

    frequency_score = minmax(comment_count, max(total_comments * 0.18, 1))
    cross_video_score = minmax(unique_video_count, max(total_videos, 1))
    request_score = minmax(request_count, max(comment_count, 1))
    recency_score = minmax(recency, max(comment_count, 1))
    engagement_score = minmax(total_likes, max(max_likes, 1))

    score = (
        frequency_score * 0.35
        + cross_video_score * 0.20
        + request_score * 0.15
        + recency_score * 0.10
        + engagement_score * 0.10
        + cohesion_score * 0.10
    )
    return round(max(0.0, min(100.0, score)), 2)


def content_opportunity_score(
    audience_score: float,
    cluster: pd.DataFrame,
    total_videos: int,
    max_likes: float,
    historical_fit: Optional[float] = None,
) -> float:
    weights = {
        "audience": 0.30,
        "cross_video": 0.20,
        "competitor": 0.15,
        "gap": 0.15,
        "recency": 0.10,
        "historical": 0.10,
    }
    unique_video_count = int(cluster["video_id"].nunique()) if "video_id" in cluster.columns else 1
    source_types = set(cluster.get("source_type", pd.Series(["unknown"])).dropna().astype(str))
    competitor_score = 100.0 if "competitor" in source_types else 0.0
    gap_score = 100.0 if source_types == {"competitor"} else 60.0 if "competitor" in source_types else 35.0
    recency_score = minmax(recent_count(cluster), max(len(cluster), 1))
    cross_video_score = minmax(unique_video_count, max(total_videos, 1))

    signals = {
        "audience": audience_score,
        "cross_video": cross_video_score,
        "competitor": competitor_score,
        "gap": gap_score,
        "recency": recency_score,
    }
    if historical_fit is not None:
        signals["historical"] = historical_fit
    else:
        weights.pop("historical")

    weight_total = sum(weights[key] for key in signals)
    score = sum(signals[key] * weights[key] for key in signals) / max(weight_total, 0.01)
    return round(max(0.0, min(100.0, score)), 2)

