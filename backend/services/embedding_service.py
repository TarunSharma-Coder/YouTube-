from __future__ import annotations

from functools import lru_cache
from typing import List, Tuple

import numpy as np


@lru_cache(maxsize=1)
def _sentence_transformer():
    try:
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    except Exception:
        return None


def create_embeddings(texts: List[str]) -> Tuple[np.ndarray, str]:
    model = _sentence_transformer()
    if model is not None:
        vectors = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
        return np.asarray(vectors), "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer

        vectorizer = TfidfVectorizer(max_features=512, ngram_range=(1, 2))
        matrix = vectorizer.fit_transform(texts)
        return matrix.toarray(), "tfidf-fallback"
    except Exception:
        vectors = np.zeros((len(texts), 16), dtype=float)
        for row_index, text in enumerate(texts):
            for token in str(text).lower().split():
                vectors[row_index, hash(token) % 16] += 1
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        vectors = vectors / np.maximum(norms, 1)
        return vectors, "hash-fallback"

