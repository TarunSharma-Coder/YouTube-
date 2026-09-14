from __future__ import annotations

import math
from datetime import date, datetime
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app import (
    add_content_categories,
    build_next_post_recommendations,
    build_seasonal_opportunities,
    build_youtube_data_fit_report,
    candidate_search_intents,
    content_gap_opportunities,
    content_gap_summary_sheet,
    dedupe_videos,
    detect_youtube_trends,
    deterministic_title_analysis,
    filter_market_scores_by_niche,
    infer_niche_keywords,
    hook_table,
    keyword_table,
    load_api_key,
    prepare_video_frame,
    market_video_evidence_sheet,
    trend_keyword_table,
    load_openai_api_key,
    search_market_videos,
    score_search_intents,
)
from thumbnail_analyzer import analyze_thumbnail_package

router = APIRouter(prefix="/api/insights", tags=["insights"])


class VideosRequest(BaseModel):
    videos: List[Dict[str, Any]] = Field(default_factory=list)
    own_channel_title: str = ""
    query: str = ""
    youtube_api_key: str = ""
    search_seed_text: str = ""
    enable_youtube_search: bool = False
    search_days: int = Field(default=30, ge=1, le=180)
    max_results_per_intent: int = Field(default=8, ge=1, le=25)
    region_code: str = "IN"
    relevance_language: str = "en"
    search_order: str = "relevance"


class TitleAnalyzeRequest(VideosRequest):
    title: str = Field(..., min_length=1)
    packaging_score: int = Field(default=70, ge=0, le=100)


def json_safe(value: Any) -> Any:
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


def records(df: pd.DataFrame, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    if df.empty:
        return []
    frame = df.head(limit).copy() if limit else df.copy()
    frame = frame.astype(object).where(pd.notnull(frame), None)
    return [{key: json_safe(value) for key, value in row.items()} for row in frame.to_dict("records")]


def videos_frame(videos: List[Dict[str, Any]]) -> pd.DataFrame:
    if not videos:
        return pd.DataFrame()
    frame = pd.DataFrame(videos)
    if "published_at" not in frame.columns and "upload_date" in frame.columns:
        frame["published_at"] = frame["upload_date"]
    if "views" in frame.columns:
        frame["views"] = pd.to_numeric(frame["views"], errors="coerce").fillna(0)
    if "views_per_day" in frame.columns:
        frame["views_per_day"] = pd.to_numeric(frame["views_per_day"], errors="coerce").fillna(0)
    frame = prepare_video_frame(add_content_categories(dedupe_videos(frame)))
    if "views_per_day" not in frame.columns:
        frame["views_per_day"] = 0
    median_velocity = max(float(pd.to_numeric(frame["views_per_day"], errors="coerce").fillna(0).median()), 1.0)
    if "outlier_score" not in frame.columns:
        frame["outlier_score"] = (
            pd.to_numeric(frame["views_per_day"], errors="coerce").fillna(0) / median_velocity
        ).round(2)
    else:
        frame["outlier_score"] = pd.to_numeric(frame["outlier_score"], errors="coerce").fillna(
            pd.to_numeric(frame["views_per_day"], errors="coerce").fillna(0) / median_velocity
        ).round(2)
    return frame


@router.post("/competitors")
def competitor_insights(payload: VideosRequest) -> Dict[str, Any]:
    frame = videos_frame(payload.videos)
    if frame.empty:
        return {"summary": [], "activity": []}
    summary = (
        frame.groupby("channel", dropna=False)
        .agg(
            videos=("video_id", "nunique"),
            total_views=("views", "sum"),
            median_views=("views", "median"),
            avg_views_per_day=("views_per_day", "mean"),
            outlier_rate=("outlier_score", lambda values: round(float((values >= 1.5).mean() * 100), 1)),
        )
        .round(2)
        .reset_index()
        .sort_values("total_views", ascending=False)
    )
    activity = (
        frame.sort_values(["published_at", "views"], ascending=False)
        [["channel", "title", "published_at", "views", "views_per_day", "outlier_score", "url", "thumbnail"]]
        .head(30)
    )
    return {"summary": records(summary), "activity": records(activity)}


@router.post("/outliers")
def outlier_insights(payload: VideosRequest) -> Dict[str, Any]:
    frame = videos_frame(payload.videos)
    if frame.empty:
        return {"metrics": {}, "videos": []}
    outliers = frame.sort_values(["outlier_score", "views_per_day", "views"], ascending=False)
    strong = outliers[outliers["outlier_score"] >= 1.5]
    topic = ""
    if "content_topic" in frame.columns and not frame["content_topic"].dropna().empty:
        topic = str(frame["content_topic"].mode().iloc[0])
    elif "keywords" in frame.columns and not frame["keywords"].dropna().empty:
        topic = str(frame["keywords"].iloc[0]).split(",")[0]
    metrics = {
        "total_outliers": int((frame["outlier_score"] >= 1.5).sum()),
        "super_outliers": int((frame["outlier_score"] >= 3).sum()),
        "median_outlier_score": round(float(frame["outlier_score"].median()), 2),
        "top_topic": topic,
    }
    return {"metrics": metrics, "videos": records(strong if not strong.empty else outliers, 100)}


@router.post("/trends")
def trend_insights(payload: VideosRequest) -> Dict[str, Any]:
    frame = videos_frame(payload.videos)
    if frame.empty:
        return {
            "trends": [],
            "keywords": [],
            "current_videos": [],
            "search_trends": [],
            "search_evidence": [],
            "search_intents": [],
            "search_errors": [],
            "search_summary": {
                "search_volume_note": "YouTube Data API does not provide exact audience search volume.",
                "market_videos_sampled": 0,
                "unique_intents": 0,
            },
        }
    try:
        trends, current_df, _ = detect_youtube_trends(frame, current_window_days=30, minimum_current_videos=1)
        keywords = trend_keyword_table(current_df)
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    search_trends = pd.DataFrame()
    search_evidence = pd.DataFrame()
    search_intents: List[str] = []
    search_errors: List[str] = []
    search_summary = {
        "search_volume_note": "YouTube Data API does not provide exact audience search volume. This is a demand proxy using recent YouTube search results, views/day, outliers, competitor coverage, and recency.",
        "market_videos_sampled": 0,
        "unique_intents": 0,
        "niche_keywords": ", ".join(infer_niche_keywords(frame, limit=10)),
    }

    if payload.enable_youtube_search:
        api_key = (payload.youtube_api_key or load_api_key()).strip()
        if not api_key:
            search_errors.append("YouTube Data API key missing, so live YouTube search trends were skipped.")
        else:
            niche_keywords = infer_niche_keywords(frame, limit=12)
            search_intents = candidate_search_intents(
                payload.own_channel_title,
                frame,
                payload.query,
                payload.search_seed_text,
                limit=8,
            )
            search_intents = [
                intent
                for intent in search_intents
                if not niche_keywords or any(keyword in intent.lower() for keyword in niche_keywords[:8])
            ] or search_intents[:8]
            search_summary["unique_intents"] = len(search_intents)
            try:
                market_videos, search_errors = search_market_videos(
                    search_intents,
                    api_key=api_key,
                    days=payload.search_days,
                    max_results_per_intent=payload.max_results_per_intent,
                    order=payload.search_order,
                    region_code=payload.region_code or "IN",
                    relevance_language=payload.relevance_language or "en",
                )
                if not market_videos.empty:
                    scored = score_search_intents(
                        payload.own_channel_title,
                        frame,
                        market_videos,
                        days=payload.search_days,
                    )
                    search_trends = filter_market_scores_by_niche(scored, niche_keywords)
                    search_evidence = market_video_evidence_sheet(market_videos)
                    search_summary["market_videos_sampled"] = int(market_videos["video_id"].nunique()) if "video_id" in market_videos.columns else int(len(market_videos))
            except Exception as error:
                search_errors.append(f"Live YouTube search trend analysis failed: {error}")

    return {
        "trends": records(trends, 80),
        "keywords": records(keywords, 120),
        "current_videos": records(current_df.sort_values("views_per_day", ascending=False), 80),
        "search_trends": records(search_trends, 80),
        "search_evidence": records(search_evidence, 120),
        "search_intents": search_intents,
        "search_errors": search_errors,
        "search_summary": search_summary,
    }


@router.post("/seasonality")
def seasonality_insights(payload: VideosRequest) -> Dict[str, Any]:
    frame = videos_frame(payload.videos)
    seasonal = build_seasonal_opportunities(frame)
    return {"opportunities": records(seasonal, 240)}


@router.post("/search-demand")
def search_demand_insights(payload: VideosRequest) -> Dict[str, Any]:
    frame = videos_frame(payload.videos)
    if frame.empty:
        return {"keywords": [], "hooks": [], "gaps": []}
    keywords = keyword_table(frame, top_n=80)
    hooks = hook_table(frame, top_n=80)
    gaps = content_gap_opportunities(payload.own_channel_title, frame, days=30) if payload.own_channel_title else pd.DataFrame()
    return {"keywords": records(keywords), "hooks": records(hooks), "gaps": records(gaps)}


@router.post("/opportunities")
def opportunity_insights(payload: VideosRequest) -> Dict[str, Any]:
    frame = videos_frame(payload.videos)
    if frame.empty:
        return {"opportunities": [], "content_gap_summary": []}
    recommendations = build_next_post_recommendations(payload.own_channel_title, frame, top_n=12)
    gap_summary = content_gap_summary_sheet(frame, days=30)
    return {"opportunities": records(recommendations), "content_gap_summary": records(gap_summary)}


@router.post("/title/analyze")
def title_analyze(payload: TitleAnalyzeRequest) -> Dict[str, Any]:
    frame = videos_frame(payload.videos)
    title = deterministic_title_analysis(payload.title)
    fit_report, fit_table = build_youtube_data_fit_report(payload.title, frame, payload.packaging_score)
    return {
        "title_analysis": {key: json_safe(value) for key, value in title.items()},
        "fit_report": {key: json_safe(value) for key, value in fit_report.items()},
        "similar_patterns": records(fit_table, 30),
    }


@router.post("/thumbnail/analyze")
async def thumbnail_analyze(
    title: str = Form(...),
    openai_api_key: str = Form(default=""),
    image: UploadFile = File(...),
) -> Dict[str, Any]:
    image_bytes = await image.read()
    result = analyze_thumbnail_package(
        title=title,
        image_bytes=image_bytes,
        filename=image.filename or "thumbnail.png",
        mime_type=image.content_type or "",
        api_key=(openai_api_key or load_openai_api_key()).strip(),
    )
    return result
