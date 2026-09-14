"use client";

import { FormEvent, useMemo, useState } from "react";
import { analyzeChannel } from "@/lib/api";
import type { ChannelAnalysisResponse, Timeframe } from "@/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function defaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().slice(0, 10);
}

export function parseCompetitors(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

const defaultDemoData: ChannelAnalysisResponse = {
  date_range: {
    start_date: "2026-06-01",
    end_date: "2026-09-14",
  },
  own_channel: {
    id: "own_1",
    title: "@TechExplorer",
    description: "Tech, AI & YouTube Growth Strategy Tutorials",
    subscriber_count: 148000,
    view_count: 14200000,
    video_count: 210,
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
  },
  own_videos: [
    {
      video_id: "v1",
      title: "How to Create a High CTR Thumbnail in 2026",
      channel: "@TechExplorer",
      views: 184000,
      likes: 8900,
      comments: 420,
      views_per_day: 4903,
      video_age_days: 30,
      duration_minutes: 12.6,
      upload_date: "2026-08-15",
      video_type: "long",
      outlier_score: 2.8,
      keywords: "thumbnail, ctr, youtube, design, visual",
      hook_keywords: "how to, create, high ctr",
      content_category: "Strategy",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
    },
    {
      video_id: "v2",
      title: "Top 10 Complete Audience Growth Strategies for YouTube",
      channel: "@TechExplorer",
      views: 142000,
      likes: 6200,
      comments: 310,
      views_per_day: 3800,
      video_age_days: 43,
      duration_minutes: 15.2,
      upload_date: "2026-08-02",
      video_type: "long",
      outlier_score: 2.1,
      keywords: "audience, growth, youtube, strategy",
      hook_keywords: "top 10, complete, growth",
      content_category: "Tutorial",
    },
    {
      video_id: "v5",
      title: "YouTube Shorts Virality Hack #shorts",
      channel: "@TechExplorer",
      views: 95000,
      likes: 4500,
      comments: 180,
      views_per_day: 2900,
      video_age_days: 13,
      duration_minutes: 0.75,
      upload_date: "2026-09-01",
      video_type: "Shorts",
      outlier_score: 1.8,
      keywords: "shorts, virality, hack",
      hook_keywords: "virality, hack",
      content_category: "Shorts",
    },
  ],
  competitor_channels: [
    {
      id: "comp_1",
      title: "@CodeMasterAI",
      subscriber_count: 320000,
      view_count: 28000000,
      video_count: 340,
    },
    {
      id: "comp_2",
      title: "@DataSciencePro",
      subscriber_count: 95000,
      view_count: 8500000,
      video_count: 150,
    },
    {
      id: "comp_3",
      title: "@AIStrategyHub",
      subscriber_count: 450000,
      view_count: 42000000,
      video_count: 480,
    },
  ],
  competitor_videos: [
    {
      video_id: "v3",
      title: "How to Engage The Least Interested Viewers",
      channel: "@CodeMasterAI",
      views: 290000,
      likes: 14000,
      comments: 850,
      views_per_day: 6100,
      video_age_days: 25,
      duration_minutes: 18.4,
      upload_date: "2026-08-20",
      video_type: "long",
      outlier_score: 3.4,
      keywords: "engage, audience, retention",
      hook_keywords: "how to, engage",
      content_category: "Strategy",
    },
    {
      video_id: "v4",
      title: "How to Return The Created Videos to Search Recommendations",
      channel: "@AIStrategyHub",
      views: 410000,
      likes: 19500,
      comments: 1200,
      views_per_day: 8900,
      video_age_days: 17,
      duration_minutes: 9.8,
      upload_date: "2026-08-28",
      video_type: "long",
      outlier_score: 4.1,
      keywords: "search, recommendations, algorithm",
      hook_keywords: "how to, algorithm",
      content_category: "Algorithm",
    },
  ],
  all_videos: [
    {
      video_id: "v1",
      title: "How to Create a High CTR Thumbnail in 2026",
      channel: "@TechExplorer",
      views: 184000,
      likes: 8900,
      comments: 420,
      views_per_day: 4903,
      video_age_days: 30,
      duration_minutes: 12.6,
      upload_date: "2026-08-15",
      video_type: "long",
      outlier_score: 2.8,
      keywords: "thumbnail, ctr, youtube, design, visual",
      hook_keywords: "how to, create, high ctr",
      content_category: "Strategy",
    },
    {
      video_id: "v2",
      title: "Top 10 Complete Audience Growth Strategies for YouTube",
      channel: "@TechExplorer",
      views: 142000,
      likes: 6200,
      comments: 310,
      views_per_day: 3800,
      video_age_days: 43,
      duration_minutes: 15.2,
      upload_date: "2026-08-02",
      video_type: "long",
      outlier_score: 2.1,
      keywords: "audience, growth, youtube, strategy",
      hook_keywords: "top 10, complete, growth",
      content_category: "Tutorial",
    },
    {
      video_id: "v3",
      title: "How to Engage The Least Interested Viewers",
      channel: "@CodeMasterAI",
      views: 290000,
      likes: 14000,
      comments: 850,
      views_per_day: 6100,
      video_age_days: 25,
      duration_minutes: 18.4,
      upload_date: "2026-08-20",
      video_type: "long",
      outlier_score: 3.4,
      keywords: "engage, audience, retention",
      hook_keywords: "how to, engage",
      content_category: "Strategy",
    },
    {
      video_id: "v4",
      title: "How to Return The Created Videos to Search Recommendations",
      channel: "@AIStrategyHub",
      views: 410000,
      likes: 19500,
      comments: 1200,
      views_per_day: 8900,
      video_age_days: 17,
      duration_minutes: 9.8,
      upload_date: "2026-08-28",
      video_type: "long",
      outlier_score: 4.1,
      keywords: "search, recommendations, algorithm",
      hook_keywords: "how to, algorithm",
      content_category: "Algorithm",
    },
    {
      video_id: "v5",
      title: "YouTube Shorts Virality Hack #shorts",
      channel: "@TechExplorer",
      views: 95000,
      likes: 4500,
      comments: 180,
      views_per_day: 2900,
      video_age_days: 13,
      duration_minutes: 0.75,
      upload_date: "2026-09-01",
      video_type: "Shorts",
      outlier_score: 1.8,
      keywords: "shorts, virality, hack",
      hook_keywords: "virality, hack",
      content_category: "Shorts",
    },
  ],
  summary: [
    { channel_id: "own_1", channel: "@TechExplorer", videos: 18, total_views: 890000, avg_views: 49444, avg_views_per_day: 4903 },
    { channel_id: "comp_1", channel: "@CodeMasterAI", videos: 24, total_views: 1420000, avg_views: 59166, avg_views_per_day: 5210 },
    { channel_id: "comp_2", channel: "@DataSciencePro", videos: 15, total_views: 650000, avg_views: 43333, avg_views_per_day: 3100 },
    { channel_id: "comp_3", channel: "@AIStrategyHub", videos: 30, total_views: 2100000, avg_views: 70000, avg_views_per_day: 6800 },
  ],
  competitor_errors: [],
};

export function useChannelAnalysis() {
  const [ownChannelUrl, setOwnChannelUrl] = useState("https://www.youtube.com/@TechExplorer");
  const [competitors, setCompetitors] = useState("https://www.youtube.com/@CodeMasterAI\nhttps://www.youtube.com/@DataSciencePro");
  const [youtubeApiKey, setYoutubeApiKey] = useState("");
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [endDate, setEndDate] = useState(todayIso());
  const [timeframe, setTimeframe] = useState<Timeframe>("90D");
  const [maxVideos, setMaxVideos] = useState(100);
  const [result, setResult] = useState<ChannelAnalysisResponse | null>(defaultDemoData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const totals = useMemo(() => {
    const videos = result?.all_videos ?? [];
    const totalViews = videos.reduce((sum, video) => sum + Number(video.views ?? 0), 0);
    const avgViewsPerDay = videos.length
      ? videos.reduce((sum, video) => sum + Number(video.views_per_day ?? 0), 0) / videos.length
      : 0;
    const outliers = videos.filter((video) => Number(video.outlier_score ?? 0) >= 1.5).length;

    return {
      videos: videos.length,
      totalViews,
      avgViewsPerDay,
      competitors: result?.competitor_channels.length ?? 0,
      outliers,
      trendScore: videos.length ? Math.min(100, Math.round(avgViewsPerDay / 1000 + outliers * 3)) : 0,
    };
  }, [result]);

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await analyzeChannel({
        own_channel_url: ownChannelUrl,
        competitor_channel_urls: parseCompetitors(competitors),
        youtube_api_key: youtubeApiKey || undefined,
        start_date: startDate,
        end_date: endDate,
        max_videos_per_channel: maxVideos,
      });
      setResult(response);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return {
    ownChannelUrl,
    setOwnChannelUrl,
    competitors,
    setCompetitors,
    youtubeApiKey,
    setYoutubeApiKey,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    timeframe,
    setTimeframe,
    maxVideos,
    setMaxVideos,
    result,
    error,
    loading,
    totals,
    submit,
  };
}

