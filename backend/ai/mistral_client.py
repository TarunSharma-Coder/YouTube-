from __future__ import annotations

import json
from typing import Any, Dict, List, Tuple

import requests

DEFAULT_MISTRAL_BASE_URL = "https://api.mistral.ai/v1"
DEFAULT_MISTRAL_MODEL = "open-mistral-7b"


def parse_json_object(text: str) -> Dict[str, Any]:
    if not text:
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return {}
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            return {}


def call_mistral_json(
    api_key: str,
    messages: List[Dict[str, str]],
    model: str = DEFAULT_MISTRAL_MODEL,
    base_url: str = DEFAULT_MISTRAL_BASE_URL,
    max_tokens: int = 3500,
) -> Tuple[Dict[str, Any], str]:
    if not api_key:
        return {}, "MISTRAL_API_KEY missing. Add it to .env to enable AI interpretation."

    active_model = model or DEFAULT_MISTRAL_MODEL
    try:
        response = requests.post(
            f"{base_url.rstrip('/')}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": active_model,
                "messages": messages,
                "temperature": 0.35,
                "max_tokens": max_tokens,
                "response_format": {"type": "json_object"},
            },
            timeout=60,
        )
        # If tier error, automatically retry with open-mistral-7b
        if response.status_code == 403 and "tier_not_allowed" in response.text and active_model != "open-mistral-7b":
            active_model = "open-mistral-7b"
            response = requests.post(
                f"{base_url.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": active_model,
                    "messages": messages,
                    "temperature": 0.35,
                    "max_tokens": max_tokens,
                    "response_format": {"type": "json_object"},
                },
                timeout=60,
            )

        response.raise_for_status()
        payload = response.json()
        text = payload["choices"][0]["message"]["content"]
    except requests.HTTPError as error:
        details = error.response.text if error.response is not None else str(error)
        return {}, f"Mistral API error: {details}"
    except Exception as error:
        return {}, f"Mistral request failed: {error}"

    parsed = parse_json_object(text)
    if not parsed:
        return {}, "Mistral returned malformed JSON."
    return parsed, ""

