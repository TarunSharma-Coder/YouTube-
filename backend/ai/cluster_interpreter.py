from __future__ import annotations

import json
from typing import Any, Dict, List, Tuple

from backend.ai.mistral_client import call_mistral_json


def normalize_interpretation(raw: Dict[str, Any], fallback_name: str) -> Dict[str, Any]:
    return {
        "cluster_name": str(raw.get("cluster_name") or fallback_name).strip()[:80],
        "primary_topic": str(raw.get("primary_topic") or "").strip()[:80],
        "sub_topic": str(raw.get("sub_topic") or "").strip()[:80],
        "main_pain_point": str(raw.get("main_pain_point") or "").strip()[:200],
        "audience_intent": str(raw.get("audience_intent") or "Other").strip()[:60],
        "audience_stage": str(raw.get("audience_stage") or "").strip()[:80],
        "content_request": str(raw.get("content_request") or "").strip()[:200],
        "common_questions": [str(item).strip() for item in raw.get("common_questions", []) if str(item).strip()][:6],
        "emotion_summary": str(raw.get("emotion_summary") or "").strip()[:200],
        "summary": str(raw.get("summary") or "").strip()[:320],
        "content_opportunity": str(raw.get("content_opportunity") or "").strip()[:260],
        "recommended_angle": str(raw.get("recommended_angle") or "").strip()[:180],
        "urgency": str(raw.get("urgency") or "medium").lower()
        if str(raw.get("urgency") or "medium").lower() in {"low", "medium", "high"}
        else "medium",
    }


def interpret_clusters(
    clusters: List[Dict[str, Any]],
    api_key: str,
    model: str,
    base_url: str,
) -> Tuple[Dict[int, Dict[str, Any]], str]:
    if not clusters:
        return {}, ""

    prompt = f"""
Interpret these YouTube audience-demand clusters using only the supplied evidence.

Return valid JSON only:
{{
  "clusters": [
    {{
      "cluster_id": 0,
      "cluster_name": "",
      "primary_topic": "",
      "sub_topic": "",
      "main_pain_point": "",
      "audience_intent": "Question|Content Request|Pain Point|Complaint|Confusion|Positive Feedback|Negative Feedback|Comparison|Purchase Intent|Exam Concern|Other",
      "audience_stage": "",
      "content_request": "",
      "common_questions": [],
      "emotion_summary": "",
      "summary": "",
      "content_opportunity": "",
      "recommended_angle": "",
      "urgency": "low|medium|high"
    }}
  ]
}}

Rules:
- Do not invent topics not present in evidence.
- Distinguish direct requests from inferred opportunities.
- Do not identify commenters.
- Do not infer sensitive personal traits.
- Keep names concise and useful for a YouTube manager.

Cluster evidence:
{json.dumps(clusters, ensure_ascii=False)}
"""
    raw, error = call_mistral_json(
        api_key,
        [
            {"role": "system", "content": "You are a careful YouTube audience research analyst. Return JSON only."},
            {"role": "user", "content": prompt},
        ],
        model=model,
        base_url=base_url,
    )
    if error:
        return {}, error

    output: Dict[int, Dict[str, Any]] = {}
    for item in raw.get("clusters", []):
        if not isinstance(item, dict):
            continue
        try:
            cluster_id = int(item.get("cluster_id"))
        except Exception:
            continue
        output[cluster_id] = normalize_interpretation(item, f"Audience Theme {cluster_id + 1}")
    return output, ""

