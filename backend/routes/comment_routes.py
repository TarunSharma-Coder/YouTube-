from __future__ import annotations

import logging
from typing import Dict, List

import pandas as pd
from fastapi import APIRouter, HTTPException

from app import fetch_video_comments, load_api_key, load_env_value
from backend.models.comment_models import CommentAnalysisRequest, CommentAnalysisResponse
from backend.services.audience_intelligence_service import analyze_comment_dataframe

router = APIRouter(prefix="/api/comments", tags=["comments"])
logger = logging.getLogger(__name__)


def video_lookup_from_payload(payload: CommentAnalysisRequest) -> Dict[str, Dict]:
    lookup: Dict[str, Dict] = {}
    for video in payload.videos:
        lookup[video.video_id] = {
            "title": video.title,
            "channel": video.channel,
            "source_type": video.source_type,
            "url": video.url,
            "published_at": video.published_at,
            "views": video.views,
            "outlier_score": video.outlier_score,
            "topic": video.topic,
        }
    return lookup


@router.post("/analyze", response_model=CommentAnalysisResponse)
def analyze_comments(payload: CommentAnalysisRequest) -> CommentAnalysisResponse:
    api_key = (payload.youtube_api_key or load_api_key()).strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="YouTube Data API key is required to fetch comments.")

    video_lookup = video_lookup_from_payload(payload)
    comment_frames: List[pd.DataFrame] = []
    fetch_errors: List[Dict[str, str]] = []

    for video in payload.videos:
        try:
            comments = fetch_video_comments(
                video.video_id,
                api_key,
                max_comments=payload.comment_limit_per_video,
                order="relevance",
            )
            if not comments.empty:
                safe_columns = [
                    column
                    for column in [
                        "comment_id",
                        "video_id",
                        "comment_text",
                        "comment_likes",
                        "comment_published_at",
                        "reply_count",
                    ]
                    if column in comments.columns
                ]
                comment_frames.append(comments[safe_columns].copy())
        except Exception as error:
            logger.warning("Comment fetch failed for %s: %s", video.video_id, error)
            fetch_errors.append({"video_id": video.video_id, "error": str(error)})

    raw_comments = pd.concat(comment_frames, ignore_index=True) if comment_frames else pd.DataFrame()

    mistral_api_key = (
        payload.mistral_api_key
        or load_env_value("MISTRAL_API_KEY")
        or load_env_value("MISTRAL_AI_API_KEY")
    ).strip()
    mistral_model = load_env_value("MISTRAL_MODEL") or "open-mistral-7b"
    mistral_base_url = load_env_value("MISTRAL_BASE_URL") or "https://api.mistral.ai/v1"

    result = analyze_comment_dataframe(
        raw_comments,
        video_lookup=video_lookup,
        mistral_api_key=mistral_api_key,
        mistral_model=mistral_model,
        mistral_base_url=mistral_base_url,
        include_ai=payload.include_ai,
    )
    result.fetch_errors = fetch_errors
    return result

