from __future__ import annotations

import math
import logging
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

logging.getLogger("streamlit.runtime.caching.cache_data_api").setLevel(logging.ERROR)

from app import (  # noqa: E402
    MAX_COMPETITORS,
    add_content_categories,
    dedupe_channels,
    dedupe_videos,
    load_api_key,
    load_channel_videos_for_date_range,
    parse_competitor_urls,
    uploaded_videos_export_sheet,
)

from backend.routes.comment_routes import router as comment_router  # noqa: E402
from backend.routes.insight_routes import router as insight_router  # noqa: E402


import os

app = FastAPI(title="YouTube Growth Intelligence API", version="0.1.0")

cors_origins_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = (
    [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
    if cors_origins_env
    else [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(comment_router)
app.include_router(insight_router)


class ChannelAnalysisRequest(BaseModel):
    own_channel_url: str = Field(..., min_length=1)
    competitor_channel_urls: List[str] = Field(default_factory=list)
    youtube_api_key: Optional[str] = None
    start_date: date
    end_date: date
    max_videos_per_channel: int = Field(default=100, ge=1, le=2000)

    @field_validator("competitor_channel_urls", mode="before")
    @classmethod
    def normalize_competitors(cls, value: Any) -> List[str]:
        if value is None:
            return []
        if isinstance(value, str):
            return parse_competitor_urls(value)
        if isinstance(value, list):
            parsed: List[str] = []
            for item in value:
                for url in parse_competitor_urls(str(item)):
                    if url not in parsed:
                        parsed.append(url)
            return parsed[:MAX_COMPETITORS]
        return []


def json_safe_value(value: Any) -> Any:
    if isinstance(value, (pd.Timestamp, datetime, date)):
        return value.isoformat()
    if hasattr(value, "item"):
        return value.item()
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    if not isinstance(value, (list, dict, tuple)):
        try:
            if pd.isna(value):
                return None
        except (TypeError, ValueError):
            pass
    return value


def dataframe_records(df: pd.DataFrame) -> List[Dict[str, Any]]:
    if df.empty:
        return []
    safe = df.copy()
    safe = safe.astype(object).where(pd.notnull(safe), None)
    return [
        {key: json_safe_value(value) for key, value in row.items()}
        for row in safe.to_dict("records")
    ]


def compact_channel(channel: Dict[str, Any]) -> Dict[str, Any]:
    return {key: json_safe_value(value) for key, value in channel.items()}


def numeric_column(df: pd.DataFrame, column: str) -> pd.Series:
    if column not in df.columns:
        return pd.Series([0] * len(df), index=df.index, dtype="float64")
    return pd.to_numeric(df[column], errors="coerce").fillna(0)


def channel_summary(channel: Dict[str, Any], videos: pd.DataFrame) -> Dict[str, Any]:
    if videos.empty:
        return {
            "channel_id": channel.get("id"),
            "channel": channel.get("title"),
            "videos": 0,
            "total_views": 0,
            "avg_views": 0,
            "avg_views_per_day": 0,
        }
    views = numeric_column(videos, "views")
    views_per_day = numeric_column(videos, "views_per_day")
    return {
        "channel_id": channel.get("id"),
        "channel": channel.get("title"),
        "videos": int(videos["video_id"].nunique()) if "video_id" in videos.columns else int(len(videos)),
        "total_views": int(views.sum()),
        "avg_views": round(float(views.mean()), 2),
        "avg_views_per_day": round(float(views_per_day.mean()), 2),
    }


@app.api_route("/", methods=["GET", "HEAD"])
def root() -> Dict[str, str]:
    return {"status": "ok", "message": "YouTube Growth Intelligence API is running"}


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/channel-analysis")
def analyse_channels(payload: ChannelAnalysisRequest) -> Dict[str, Any]:
    if payload.start_date > payload.end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")

    api_key = (payload.youtube_api_key or load_api_key()).strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="YouTube Data API key is required")

    start_text = payload.start_date.isoformat()
    end_text = payload.end_date.isoformat()

    try:
        own_channel, own_videos = load_channel_videos_for_date_range(
            payload.own_channel_url,
            api_key,
            start_text,
            end_text,
            payload.max_videos_per_channel,
        )
        own_videos = dedupe_videos(own_videos)

        competitor_channels = []
        competitor_frames = []
        competitor_errors = []
        for competitor_url in payload.competitor_channel_urls[:MAX_COMPETITORS]:
            try:
                channel, videos = load_channel_videos_for_date_range(
                    competitor_url,
                    api_key,
                    start_text,
                    end_text,
                    payload.max_videos_per_channel,
                )
                competitor_channels.append(channel)
                competitor_frames.append(dedupe_videos(videos))
            except Exception as error:
                competitor_errors.append({"channel_url": competitor_url, "error": str(error)})

        competitor_channels = dedupe_channels(competitor_channels)
        competitor_videos = (
            pd.concat(competitor_frames, ignore_index=True)
            if competitor_frames
            else pd.DataFrame(columns=own_videos.columns)
        )
        competitor_videos = dedupe_videos(competitor_videos)
        own_videos = add_content_categories(own_videos)
        competitor_videos = add_content_categories(competitor_videos)
        all_videos = add_content_categories(
            dedupe_videos(pd.concat([own_videos, competitor_videos], ignore_index=True))
        )
        own_video_sheet = uploaded_videos_export_sheet(own_videos)
        competitor_video_sheet = uploaded_videos_export_sheet(competitor_videos)
        all_video_sheet = uploaded_videos_export_sheet(all_videos)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    summaries = [channel_summary(own_channel, own_videos)]
    for channel in competitor_channels:
        if "channel_id" in competitor_videos.columns:
            channel_videos = competitor_videos[competitor_videos["channel_id"] == channel["id"]]
        else:
            channel_videos = pd.DataFrame()
        summaries.append(channel_summary(channel, channel_videos))

    return {
        "date_range": {"start_date": start_text, "end_date": end_text},
        "own_channel": compact_channel(own_channel),
        "own_videos": dataframe_records(own_video_sheet),
        "competitor_channels": [compact_channel(channel) for channel in competitor_channels],
        "competitor_videos": dataframe_records(competitor_video_sheet),
        "all_videos": dataframe_records(all_video_sheet),
        "summary": summaries,
        "competitor_errors": competitor_errors,
    }
