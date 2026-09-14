from __future__ import annotations

import unittest

import pandas as pd

from backend.services.audience_intelligence_service import analyze_comment_dataframe
from backend.services.clustering_service import choose_cluster_count
from backend.services.comment_preprocessor import clean_comment_text, prepare_comments
from backend.services.demand_scoring import audience_demand_score


class CommentIntelligenceTests(unittest.TestCase):
    def test_clean_comment_text_removes_urls_and_whitespace(self) -> None:
        text = clean_comment_text(" Sir please make mock analysis  \n https://example.com ")
        self.assertEqual(text, "Sir please make mock analysis")

    def test_prepare_comments_deduplicates_without_author_data(self) -> None:
        raw = pd.DataFrame(
            [
                {"comment_id": "1", "video_id": "v1", "comment_text": "Please make VARC video", "comment_likes": 2},
                {"comment_id": "2", "video_id": "v1", "comment_text": "Please make VARC video", "comment_likes": 5},
            ]
        )
        prepared = prepare_comments(raw, {"v1": {"title": "VARC", "channel": "Own", "source_type": "own"}})
        self.assertEqual(len(prepared), 1)
        self.assertNotIn("author", prepared.columns)
        self.assertIn("cleaned_comment_text", prepared.columns)

    def test_choose_cluster_count_bounds(self) -> None:
        self.assertEqual(choose_cluster_count(0), 0)
        self.assertEqual(choose_cluster_count(1), 1)
        self.assertGreaterEqual(choose_cluster_count(100), 8)
        self.assertLessEqual(choose_cluster_count(5000), 50)

    def test_demand_score_stays_in_range(self) -> None:
        cluster = pd.DataFrame(
            [
                {
                    "video_id": "v1",
                    "cleaned_comment_text": "How to analyse mock?",
                    "comment_likes": 3,
                    "comment_published_at": pd.Timestamp("2026-01-01", tz="UTC"),
                }
            ]
        )
        score = audience_demand_score(cluster, total_comments=10, total_videos=2, max_likes=3, cohesion_score=80)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)

    def test_empty_analysis_is_safe(self) -> None:
        result = analyze_comment_dataframe(pd.DataFrame(), {}, include_ai=False)
        self.assertEqual(result.metrics.comments_analyzed, 0)
        self.assertEqual(result.clusters, [])

    def test_analysis_without_mistral_returns_local_ideas(self) -> None:
        raw = pd.DataFrame(
            [
                {
                    "comment_id": str(index),
                    "video_id": "v1" if index < 6 else "v2",
                    "comment_text": f"Sir mock score improve nahi ho raha please make analysis guide {index}",
                    "comment_likes": index,
                    "comment_published_at": pd.Timestamp("2026-01-01", tz="UTC"),
                }
                for index in range(12)
            ]
        )
        lookup = {
            "v1": {"title": "Mock Analysis", "channel": "Own", "source_type": "own"},
            "v2": {"title": "CAT Mistakes", "channel": "Competitor", "source_type": "competitor"},
        }
        result = analyze_comment_dataframe(raw, lookup, include_ai=True)
        self.assertGreater(result.metrics.comments_analyzed, 0)
        self.assertGreater(len(result.clusters), 0)
        self.assertGreater(len(result.content_ideas), 0)
        self.assertIn("MISTRAL_API_KEY", result.ai_error)


if __name__ == "__main__":
    unittest.main()

