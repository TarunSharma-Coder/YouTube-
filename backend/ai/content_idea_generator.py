from __future__ import annotations

import json
from typing import Any, Dict, List, Tuple

from backend.ai.mistral_client import call_mistral_json


def normalize_idea(raw: Dict[str, Any], cluster: Dict[str, Any]) -> Dict[str, Any]:
    ideas = raw.get("ideas", [])
    if not isinstance(ideas, list):
        ideas = []
    normalized_ideas = []
    for item in ideas[:8]:
        if isinstance(item, str):
            item = {"title": item}
        if not isinstance(item, dict):
            continue
        normalized_ideas.append(
            {
                "title": str(item.get("title") or "").strip(),
                "angle": str(item.get("angle") or "").strip(),
                "hook_type": str(item.get("hook_type") or "").strip(),
                "why_it_matches_demand": str(item.get("why_it_matches_demand") or "").strip(),
                "thumbnail_angle": str(item.get("thumbnail_angle") or "").strip(),
            }
        )

    priority = str(raw.get("priority") or "medium").lower()
    if priority not in {"low", "medium", "high"}:
        priority = "medium"

    return {
        "topic": str(raw.get("topic") or cluster.get("primary_topic") or cluster.get("cluster_name") or "").strip(),
        "audience_problem": str(raw.get("audience_problem") or cluster.get("main_pain_point") or "").strip(),
        "why_this_opportunity_exists": str(
            raw.get("why_this_opportunity_exists") or cluster.get("content_opportunity") or ""
        ).strip(),
        "recommended_format": str(raw.get("recommended_format") or "Explainer").strip(),
        "priority": priority,
        "ideas": normalized_ideas,
    }


def generate_content_ideas(
    clusters: List[Dict[str, Any]],
    api_key: str,
    model: str,
    base_url: str,
) -> Tuple[List[Dict[str, Any]], str]:
    if not clusters:
        return [], ""

    prompt = f"""
Generate evidence-backed next YouTube content ideas from these audience-demand clusters.

Return valid JSON only:
{{
  "opportunities": [
    {{
      "topic": "",
      "audience_problem": "",
      "why_this_opportunity_exists": "",
      "recommended_format": "",
      "priority": "low|medium|high",
      "ideas": [
        {{
          "title": "",
          "angle": "",
          "hook_type": "",
          "why_it_matches_demand": "",
          "thumbnail_angle": ""
        }}
      ]
    }}
  ]
}}

Rules:
- Generate 5-8 distinct title/angle ideas per major opportunity when possible.
- Do not copy competitor titles.
- Do not predict CTR, views, revenue, or virality.
- Use only supplied cluster evidence, scores, questions, and representative comments.
- Keep titles useful for English/Hindi/Hinglish education audiences when evidence supports that.

Cluster insights:
{json.dumps(clusters[:8], ensure_ascii=False)}
"""
    raw, error = call_mistral_json(
        api_key,
        [
            {"role": "system", "content": "You create grounded YouTube content recommendations. Return JSON only."},
            {"role": "user", "content": prompt},
        ],
        model=model,
        base_url=base_url,
        max_tokens=4500,
    )
    if error:
        return [], error

    opportunities = raw.get("opportunities", [])
    if not isinstance(opportunities, list):
        return [], "Mistral content ideas response was malformed."

    normalized = []
    for index, item in enumerate(opportunities[:8]):
        if not isinstance(item, dict):
            continue
        cluster = clusters[min(index, len(clusters) - 1)]
        idea = normalize_idea(item, cluster)
        idea["demand_score"] = cluster.get("demand_score", 0)
        idea["opportunity_score"] = cluster.get("opportunity_score", 0)
        idea["supporting_comments"] = cluster.get("comment_count", 0)
        idea["supporting_videos"] = cluster.get("unique_video_count", 0)
        normalized.append(idea)
    return normalized, ""

