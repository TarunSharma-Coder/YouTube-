from __future__ import annotations

from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd

from backend.ai.cluster_interpreter import interpret_clusters
from backend.ai.content_idea_generator import generate_content_ideas
from backend.models.comment_models import (
    CommentAnalysisMetrics,
    CommentAnalysisResponse,
    CommentCluster,
    CommentEvidence,
    ContentIdea,
)
from backend.services.clustering_service import cluster_cohesion, cluster_comments, representative_comments
from backend.services.comment_preprocessor import prepare_comments, top_keywords
from backend.services.demand_scoring import audience_demand_score, content_opportunity_score, request_strength
from backend.services.embedding_service import create_embeddings
from backend.services.sentiment_service import analyze_sentiment


def _safe_iso(value: Any) -> str | None:
    if value is None or pd.isna(value):
        return None
    try:
        return pd.to_datetime(value, utc=True).isoformat()
    except Exception:
        return str(value)


def _evidence_rows(rows: pd.DataFrame) -> List[CommentEvidence]:
    evidence = []
    for _, row in rows.iterrows():
        evidence.append(
            CommentEvidence(
                comment_text=str(row.get("cleaned_comment_text", "")),
                video_id=str(row.get("video_id", "")),
                video_title=str(row.get("video_title", "")),
                channel=str(row.get("channel", "")),
                source_type=row.get("source_type", "unknown") or "unknown",
                comment_likes=int(row.get("comment_likes", 0) or 0),
                published_at=_safe_iso(row.get("comment_published_at")),
            )
        )
    return evidence


def _fallback_cluster_name(keywords: List[str], cluster_id: int) -> str:
    if keywords:
        return " ".join(keyword.title() for keyword in keywords[:3])
    return f"Audience Theme {cluster_id + 1}"


def _fallback_ideas(cluster_payloads: List[Dict[str, Any]]) -> List[ContentIdea]:
    ideas: List[ContentIdea] = []
    angle_types = ["How-to", "Mistake", "Checklist", "Problem Diagnosis", "Comparison"]
    for cluster in cluster_payloads[:8]:
        topic = cluster.get("cluster_name") or cluster.get("primary_topic") or "Audience Demand"
        topic_text = str(topic).strip()
        title_options = [
            f"{topic_text}: What Students Are Asking Right Now",
            f"Stop Making These {topic_text} Mistakes",
            f"Complete {topic_text} Guide Based on Student Doubts",
            f"Why Your {topic_text} Strategy Is Not Working",
            f"{topic_text} Checklist Before Your Next Step",
        ]
        ideas.append(
            ContentIdea(
                topic=topic_text,
                audience_problem=str(cluster.get("main_pain_point") or cluster.get("summary") or ""),
                why_this_opportunity_exists=(
                    f"{cluster.get('comment_count', 0)} related comment(s) across "
                    f"{cluster.get('unique_video_count', 0)} selected video(s)."
                ),
                recommended_format="Explainer",
                priority="high" if float(cluster.get("opportunity_score", 0)) >= 75 else "medium",
                demand_score=float(cluster.get("demand_score", 0)),
                opportunity_score=float(cluster.get("opportunity_score", 0)),
                supporting_comments=int(cluster.get("comment_count", 0)),
                supporting_videos=int(cluster.get("unique_video_count", 0)),
                ideas=[
                    {
                        "title": title,
                        "angle": angle_types[index % len(angle_types)],
                        "hook_type": "Audience question",
                        "why_it_matches_demand": "Generated from repeated local comment clusters.",
                        "thumbnail_angle": topic_text.upper()[:28],
                    }
                    for index, title in enumerate(title_options)
                ],
            )
        )
    return ideas


def _cluster_payload_for_ai(cluster: pd.DataFrame, evidence: List[CommentEvidence], cluster_id: int) -> Dict[str, Any]:
    return {
        "cluster_id": cluster_id,
        "comment_count": int(len(cluster)),
        "unique_video_count": int(cluster["video_id"].nunique()) if "video_id" in cluster.columns else 0,
        "source_mix": cluster.get("source_type", pd.Series(dtype=str)).value_counts().to_dict(),
        "top_keywords": top_keywords(cluster["cleaned_comment_text"].tolist(), limit=8),
        "representative_comments": [item.comment_text for item in evidence],
    }


def analyze_comment_dataframe(
    raw_comments: pd.DataFrame,
    video_lookup: Dict[str, Dict[str, Any]],
    mistral_api_key: str = "",
    mistral_model: str = "mistral-large-latest",
    mistral_base_url: str = "https://api.mistral.ai/v1",
    include_ai: bool = True,
) -> CommentAnalysisResponse:
    notes: List[str] = []
    comments = prepare_comments(raw_comments, video_lookup)
    if comments.empty:
        return CommentAnalysisResponse(
            metrics=CommentAnalysisMetrics(
                comments_analyzed=0,
                videos_analyzed=0,
                clusters_found=0,
                content_requests=0,
                questions=0,
                pain_points=0,
                positive=0,
                neutral=0,
                negative=0,
            ),
            clusters=[],
            content_ideas=[],
            top_questions=[],
            top_pain_points=[],
            most_requested_content=[],
            fetch_errors=[],
            ai_error="",
            processing_notes=["No usable comments found after cleaning."],
        )

    texts = comments["cleaned_comment_text"].tolist()
    comments["sentiment"] = analyze_sentiment(texts)
    embeddings, embedding_model = create_embeddings(texts)
    notes.append(f"Embeddings: {embedding_model}")
    comments = cluster_comments(comments, embeddings)

    total_comments = len(comments)
    total_videos = int(comments["video_id"].nunique()) if "video_id" in comments.columns else 1
    max_cluster_likes = 1.0
    for _, cluster in comments.groupby("cluster_id"):
        likes = float(pd.to_numeric(cluster.get("comment_likes", 0), errors="coerce").fillna(0).sum())
        max_cluster_likes = max(max_cluster_likes, likes)

    cluster_payloads: List[Dict[str, Any]] = []
    clusters_for_response: List[Dict[str, Any]] = []
    for cluster_id, cluster in comments.groupby("cluster_id"):
        index_positions = cluster.index.to_numpy()
        cluster_embeddings = embeddings[index_positions] if len(index_positions) else np.empty((0, 0))
        cohesion = cluster_cohesion(cluster_embeddings)
        evidence_df = representative_comments(cluster, cluster_embeddings, limit=8)
        evidence = _evidence_rows(evidence_df)
        keyword_list = top_keywords(cluster["cleaned_comment_text"].tolist(), limit=8)
        flags = cluster["cleaned_comment_text"].apply(request_strength)
        question_count = sum(1 for item in flags if item["is_question"])
        request_count = sum(1 for item in flags if item["is_request"])
        pain_count = sum(1 for item in flags if item["is_pain"])
        demand_score = audience_demand_score(
            cluster,
            total_comments=total_comments,
            total_videos=total_videos,
            max_likes=max_cluster_likes,
            cohesion_score=cohesion,
        )
        opportunity_score = content_opportunity_score(
            demand_score,
            cluster,
            total_videos=total_videos,
            max_likes=max_cluster_likes,
        )
        cluster_dict = {
            "cluster_id": int(cluster_id),
            "cluster_name": _fallback_cluster_name(keyword_list, int(cluster_id)),
            "primary_topic": keyword_list[0].title() if keyword_list else "",
            "audience_intent": "Question" if question_count >= request_count else "Content Request" if request_count else "Other",
            "audience_stage": "",
            "main_pain_point": "",
            "content_request": "",
            "emotion_summary": "",
            "summary": "",
            "content_opportunity": "",
            "recommended_angle": "",
            "urgency": "high" if demand_score >= 75 else "medium" if demand_score >= 45 else "low",
            "comment_count": int(len(cluster)),
            "unique_video_count": int(cluster["video_id"].nunique()) if "video_id" in cluster.columns else 0,
            "positive_count": int((cluster["sentiment"] == "Positive").sum()),
            "neutral_count": int((cluster["sentiment"] == "Neutral").sum()),
            "negative_count": int((cluster["sentiment"] == "Negative").sum()),
            "question_count": int(question_count),
            "request_count": int(request_count),
            "pain_count": int(pain_count),
            "recent_comment_count": int(
                pd.to_datetime(cluster["comment_published_at"], utc=True, errors="coerce")
                .ge(pd.to_datetime(cluster["comment_published_at"], utc=True, errors="coerce").max() - pd.Timedelta(days=30))
                .sum()
            )
            if "comment_published_at" in cluster.columns
            else 0,
            "total_comment_likes": int(pd.to_numeric(cluster.get("comment_likes", 0), errors="coerce").fillna(0).sum()),
            "avg_likes": round(float(pd.to_numeric(cluster.get("comment_likes", 0), errors="coerce").fillna(0).mean()), 2),
            "demand_score": demand_score,
            "opportunity_score": opportunity_score,
            "cohesion_score": cohesion,
            "top_keywords": keyword_list,
            "common_questions": [
                str(text)
                for text in cluster.loc[
                    cluster["cleaned_comment_text"].str.contains(r"\?", regex=True, na=False),
                    "cleaned_comment_text",
                ]
                .head(5)
                .tolist()
            ],
            "evidence": evidence,
        }
        clusters_for_response.append(cluster_dict)
        cluster_payloads.append(_cluster_payload_for_ai(cluster, evidence, int(cluster_id)) | {
            "demand_score": demand_score,
            "opportunity_score": opportunity_score,
        })

    clusters_for_response = sorted(
        clusters_for_response,
        key=lambda item: (item["opportunity_score"], item["demand_score"], item["comment_count"]),
        reverse=True,
    )
    cluster_payloads = sorted(
        cluster_payloads,
        key=lambda item: (item["opportunity_score"], item["demand_score"], item["comment_count"]),
        reverse=True,
    )

    ai_error = ""
    if include_ai and mistral_api_key:
        interpretations, ai_error = interpret_clusters(
            cluster_payloads[:12],
            api_key=mistral_api_key,
            model=mistral_model,
            base_url=mistral_base_url,
        )
        for cluster in clusters_for_response:
            interpretation = interpretations.get(cluster["cluster_id"])
            if interpretation:
                cluster.update(
                    {
                        "cluster_name": interpretation["cluster_name"],
                        "primary_topic": interpretation["primary_topic"],
                        "audience_intent": interpretation["audience_intent"],
                        "audience_stage": interpretation["audience_stage"],
                        "main_pain_point": interpretation["main_pain_point"],
                        "content_request": interpretation["content_request"],
                        "emotion_summary": interpretation["emotion_summary"],
                        "summary": interpretation["summary"],
                        "content_opportunity": interpretation["content_opportunity"],
                        "recommended_angle": interpretation["recommended_angle"],
                        "urgency": interpretation["urgency"],
                        "common_questions": interpretation["common_questions"] or cluster["common_questions"],
                    }
                )
        ai_input = [
            {
                key: value
                for key, value in cluster.items()
                if key not in {"evidence"}
            }
            | {"representative_comments": [item.comment_text for item in cluster["evidence"][:5]]}
            for cluster in clusters_for_response[:8]
        ]
        idea_dicts, idea_error = generate_content_ideas(
            ai_input,
            api_key=mistral_api_key,
            model=mistral_model,
            base_url=mistral_base_url,
        )
        if idea_error and not ai_error:
            ai_error = idea_error
        content_ideas = [
            ContentIdea(
                topic=str(item.get("topic", "")),
                audience_problem=str(item.get("audience_problem", "")),
                why_this_opportunity_exists=str(item.get("why_this_opportunity_exists", "")),
                recommended_format=str(item.get("recommended_format", "")),
                priority=item.get("priority", "medium"),
                demand_score=float(item.get("demand_score", 0)),
                opportunity_score=float(item.get("opportunity_score", 0)),
                supporting_comments=int(item.get("supporting_comments", 0)),
                supporting_videos=int(item.get("supporting_videos", 0)),
                ideas=item.get("ideas", []),
            )
            for item in idea_dicts
        ]
        if not content_ideas:
            content_ideas = _fallback_ideas(clusters_for_response)
    else:
        if include_ai and not mistral_api_key:
            ai_error = "MISTRAL_API_KEY missing. Local clusters and demand scores are still available."
        content_ideas = _fallback_ideas(clusters_for_response)

    typed_clusters = [CommentCluster(**cluster) for cluster in clusters_for_response]
    metrics = CommentAnalysisMetrics(
        comments_analyzed=total_comments,
        videos_analyzed=total_videos,
        clusters_found=len(typed_clusters),
        content_requests=sum(cluster.request_count for cluster in typed_clusters),
        questions=sum(cluster.question_count for cluster in typed_clusters),
        pain_points=sum(int(cluster.main_pain_point != "") for cluster in typed_clusters)
        or sum(1 for cluster in typed_clusters if cluster.negative_count > 0),
        positive=int((comments["sentiment"] == "Positive").sum()),
        neutral=int((comments["sentiment"] == "Neutral").sum()),
        negative=int((comments["sentiment"] == "Negative").sum()),
    )
    top_questions = []
    for cluster in typed_clusters:
        top_questions.extend(cluster.common_questions)
    top_pain_points = [cluster.main_pain_point for cluster in typed_clusters if cluster.main_pain_point][:10]
    most_requested_content = [cluster.content_request for cluster in typed_clusters if cluster.content_request][:10]
    if not most_requested_content:
        most_requested_content = [cluster.cluster_name for cluster in typed_clusters[:10]]

    return CommentAnalysisResponse(
        metrics=metrics,
        clusters=typed_clusters,
        content_ideas=content_ideas,
        top_questions=top_questions[:10],
        top_pain_points=top_pain_points,
        most_requested_content=most_requested_content,
        fetch_errors=[],
        ai_error=ai_error,
        processing_notes=notes,
    )

