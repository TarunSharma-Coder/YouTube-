from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


SourceType = Literal["own", "competitor", "unknown"]


class VideoContext(BaseModel):
    video_id: str = Field(..., min_length=1)
    title: str = ""
    channel: str = ""
    source_type: SourceType = "unknown"
    url: str = ""
    published_at: Optional[str] = None
    views: Optional[float] = None
    outlier_score: Optional[float] = None
    topic: str = ""


class CommentAnalysisRequest(BaseModel):
    videos: List[VideoContext] = Field(..., min_length=1, max_length=50)
    youtube_api_key: Optional[str] = None
    mistral_api_key: Optional[str] = None
    comment_limit_per_video: int = Field(default=100, ge=1, le=1000)
    include_ai: bool = True


class CommentEvidence(BaseModel):
    comment_text: str
    video_id: str
    video_title: str = ""
    channel: str = ""
    source_type: SourceType = "unknown"
    comment_likes: int = 0
    published_at: Optional[str] = None


class CommentCluster(BaseModel):
    cluster_id: int
    cluster_name: str
    primary_topic: str = ""
    audience_intent: str = "Other"
    audience_stage: str = ""
    main_pain_point: str = ""
    content_request: str = ""
    emotion_summary: str = ""
    summary: str = ""
    content_opportunity: str = ""
    recommended_angle: str = ""
    urgency: Literal["low", "medium", "high"] = "medium"
    comment_count: int
    unique_video_count: int
    positive_count: int
    neutral_count: int
    negative_count: int
    question_count: int
    request_count: int
    recent_comment_count: int
    total_comment_likes: int
    avg_likes: float
    demand_score: float
    opportunity_score: float
    cohesion_score: float
    top_keywords: List[str]
    common_questions: List[str]
    evidence: List[CommentEvidence]


class ContentIdea(BaseModel):
    topic: str
    audience_problem: str
    why_this_opportunity_exists: str
    recommended_format: str
    priority: Literal["low", "medium", "high"] = "medium"
    demand_score: float
    opportunity_score: float
    supporting_comments: int
    supporting_videos: int
    ideas: List[Dict[str, Any]]


class CommentAnalysisMetrics(BaseModel):
    comments_analyzed: int
    videos_analyzed: int
    clusters_found: int
    content_requests: int
    questions: int
    pain_points: int
    positive: int
    neutral: int
    negative: int


class CommentAnalysisResponse(BaseModel):
    metrics: CommentAnalysisMetrics
    clusters: List[CommentCluster]
    content_ideas: List[ContentIdea]
    top_questions: List[str]
    top_pain_points: List[str]
    most_requested_content: List[str]
    fetch_errors: List[Dict[str, str]]
    ai_error: str = ""
    processing_notes: List[str] = Field(default_factory=list)

