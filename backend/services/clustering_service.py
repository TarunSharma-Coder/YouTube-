from __future__ import annotations

from typing import Dict, List

import numpy as np
import pandas as pd

from backend.services.comment_preprocessor import top_keywords


def choose_cluster_count(comment_count: int) -> int:
    if comment_count <= 0:
        return 0
    if comment_count < 20:
        return min(3, comment_count)
    if comment_count < 100:
        return min(8, max(5, comment_count // 10))
    if comment_count <= 500:
        return min(15, max(8, comment_count // 35))
    if comment_count <= 2000:
        return min(30, max(15, comment_count // 80))
    return min(50, max(20, comment_count // 200))


def cluster_comments(comments: pd.DataFrame, embeddings: np.ndarray) -> pd.DataFrame:
    clustered = comments.copy()
    cluster_count = choose_cluster_count(len(clustered))
    if cluster_count <= 1:
        clustered["cluster_id"] = 0
        return clustered

    try:
        from sklearn.cluster import KMeans

        model = KMeans(n_clusters=cluster_count, random_state=42, n_init="auto")
        clustered["cluster_id"] = model.fit_predict(embeddings)
        clustered.attrs["cluster_centers"] = model.cluster_centers_
        return clustered
    except Exception:
        keywords = [
            (top_keywords([text], limit=1) or ["general"])[0]
            for text in clustered["cleaned_comment_text"].tolist()
        ]
        keyword_to_cluster: Dict[str, int] = {}
        labels: List[int] = []
        for keyword in keywords:
            if keyword not in keyword_to_cluster:
                keyword_to_cluster[keyword] = len(keyword_to_cluster) % cluster_count
            labels.append(keyword_to_cluster[keyword])
        clustered["cluster_id"] = labels
        return clustered


def cluster_cohesion(cluster_embeddings: np.ndarray) -> float:
    if len(cluster_embeddings) <= 1:
        return 100.0
    centroid = cluster_embeddings.mean(axis=0)
    distances = np.linalg.norm(cluster_embeddings - centroid, axis=1)
    avg_distance = float(np.mean(distances))
    return round(max(0.0, min(100.0, 100.0 - avg_distance * 35)), 2)


def representative_comments(cluster: pd.DataFrame, cluster_embeddings: np.ndarray, limit: int = 8) -> pd.DataFrame:
    if cluster.empty:
        return cluster

    ranked = cluster.copy()
    ranked["evidence_score"] = pd.to_numeric(ranked.get("comment_likes", 0), errors="coerce").fillna(0)
    if len(cluster_embeddings) == len(cluster):
        centroid = cluster_embeddings.mean(axis=0)
        distances = np.linalg.norm(cluster_embeddings - centroid, axis=1)
        ranked["evidence_score"] += (1 / (1 + distances)) * 5
    ranked = ranked.sort_values(["source_type", "evidence_score"], ascending=[True, False])
    ranked = ranked.drop_duplicates("cleaned_comment_text")
    return ranked.head(limit)

