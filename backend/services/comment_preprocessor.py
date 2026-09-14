from __future__ import annotations

import hashlib
import re
from typing import Dict, List

import pandas as pd

URL_RE = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
WHITESPACE_RE = re.compile(r"\s+")
SPAM_RE = re.compile(
    r"(?:subscribe\s+my\s+channel|whatsapp\s+me|telegram\s+join|earn\s+money|free\s+followers)",
    re.IGNORECASE,
)


def clean_comment_text(text: str) -> str:
    cleaned = str(text or "").replace("\r", " ").replace("\n", " ")
    cleaned = URL_RE.sub(" ", cleaned)
    cleaned = WHITESPACE_RE.sub(" ", cleaned).strip()
    return cleaned


def comment_hash(text: str) -> str:
    normalized = clean_comment_text(text).casefold()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def prepare_comments(raw_comments: pd.DataFrame, video_lookup: Dict[str, Dict]) -> pd.DataFrame:
    columns = [
        "comment_id",
        "video_id",
        "original_comment_text",
        "cleaned_comment_text",
        "comment_likes",
        "comment_published_at",
        "video_title",
        "channel",
        "source_type",
        "video_url",
        "views",
        "outlier_score",
        "comment_hash",
    ]
    if raw_comments.empty:
        return pd.DataFrame(columns=columns)

    prepared = raw_comments.copy()
    prepared["original_comment_text"] = prepared.get("comment_text", "").astype(str)
    prepared["cleaned_comment_text"] = prepared["original_comment_text"].apply(clean_comment_text)
    prepared = prepared[prepared["cleaned_comment_text"].str.len() > 0].copy()
    prepared = prepared[~prepared["cleaned_comment_text"].str.contains(SPAM_RE, na=False)].copy()
    prepared["comment_hash"] = prepared["cleaned_comment_text"].apply(comment_hash)
    prepared = prepared.drop_duplicates("comment_hash").copy()

    for column in ["comment_likes", "reply_count"]:
        if column in prepared.columns:
            prepared[column] = pd.to_numeric(prepared[column], errors="coerce").fillna(0).astype(int)

    prepared["comment_published_at"] = pd.to_datetime(
        prepared.get("comment_published_at"), utc=True, errors="coerce"
    )

    prepared["video_title"] = prepared["video_id"].map(lambda video_id: video_lookup.get(video_id, {}).get("title", ""))
    prepared["channel"] = prepared["video_id"].map(lambda video_id: video_lookup.get(video_id, {}).get("channel", ""))
    prepared["source_type"] = prepared["video_id"].map(
        lambda video_id: video_lookup.get(video_id, {}).get("source_type", "unknown")
    )
    prepared["video_url"] = prepared["video_id"].map(lambda video_id: video_lookup.get(video_id, {}).get("url", ""))
    prepared["views"] = prepared["video_id"].map(lambda video_id: video_lookup.get(video_id, {}).get("views"))
    prepared["outlier_score"] = prepared["video_id"].map(
        lambda video_id: video_lookup.get(video_id, {}).get("outlier_score")
    )

    available = [column for column in columns if column in prepared.columns]
    return prepared[available].reset_index(drop=True)


def top_keywords(texts: List[str], limit: int = 8) -> List[str]:
    stopwords = {
        "the", "and", "for", "you", "your", "this", "that", "sir", "mam", "maam", "please",
        "pls", "plz", "video", "videos", "hai", "hain", "nahi", "nhi", "kya", "kaise", "with",
        "from", "about", "make", "banao", "banaye", "class", "lecture", "will", "can", "are",
        "how", "what", "why", "when", "where", "which",
    }
    counts: Dict[str, int] = {}
    for text in texts:
        for word in re.findall(r"[A-Za-z0-9\u0900-\u097F]{3,}", str(text).lower()):
            if word in stopwords:
                continue
            counts[word] = counts.get(word, 0) + 1
    return [word for word, _ in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:limit]]
