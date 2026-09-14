export type Timeframe = "7D" | "28D" | "90D" | "1Y" | "2Y";

export type Channel = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  subscriber_count?: number;
  view_count?: number;
  video_count?: number;
};

export type Video = {
  upload_date?: string;
  channel?: string;
  title?: string;
  video_type?: string;
  views?: number;
  likes?: number;
  comments?: number;
  views_per_day?: number;
  video_age_days?: number;
  duration_minutes?: number;
  keywords?: string;
  hook_keywords?: string;
  youtube_tags?: string;
  url?: string;
  thumbnail?: string;
  video_id?: string;
  content_topic?: string;
  content_category?: string;
  outlier_score?: number;
};

export type ChannelSummary = {
  channel_id: string;
  channel: string;
  videos: number;
  total_views: number;
  avg_views: number;
  avg_views_per_day: number;
};

export type ChannelAnalysisRequest = {
  own_channel_url: string;
  competitor_channel_urls: string[];
  youtube_api_key?: string;
  start_date: string;
  end_date: string;
  max_videos_per_channel: number;
};

export type ChannelAnalysisResponse = {
  date_range: {
    start_date: string;
    end_date: string;
  };
  own_channel: Channel;
  own_videos: Video[];
  competitor_channels: Channel[];
  competitor_videos: Video[];
  all_videos: Video[];
  summary: ChannelSummary[];
  competitor_errors: Array<{ channel_url: string; error: string }>;
};

export type Outlier = Video & {
  outlier_score: number;
  reason?: string;
};

export type Trend = {
  topic: string;
  trend_score: number;
  stage: "Early" | "Emerging" | "Rising" | "Peak" | "Saturated" | "Declining";
  momentum?: number;
  competitor_adoption?: number;
};

export type SeasonalOpportunity = {
  topic: string;
  month: string;
  opportunity_score: number;
  recommended_window?: string;
};

export type Competitor = Channel & {
  monthly_views?: number;
  uploads?: number;
  outlier_rate?: number;
  recent_growth?: number;
};

export type CommentInsight = {
  type: string;
  count: number;
  demand_score?: number;
  examples?: string[];
};

export type CommentVideoContext = {
  video_id: string;
  title?: string;
  channel?: string;
  source_type: "own" | "competitor" | "unknown";
  url?: string;
  published_at?: string;
  views?: number;
  outlier_score?: number;
  topic?: string;
};

export type CommentEvidence = {
  comment_text: string;
  video_id: string;
  video_title: string;
  channel: string;
  source_type: "own" | "competitor" | "unknown";
  comment_likes: number;
  published_at?: string;
};

export type CommentCluster = {
  cluster_id: number;
  cluster_name: string;
  primary_topic: string;
  audience_intent: string;
  audience_stage: string;
  main_pain_point: string;
  content_request: string;
  emotion_summary: string;
  summary: string;
  content_opportunity: string;
  recommended_angle: string;
  urgency: "low" | "medium" | "high";
  comment_count: number;
  unique_video_count: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  question_count: number;
  request_count: number;
  recent_comment_count: number;
  total_comment_likes: number;
  avg_likes: number;
  demand_score: number;
  opportunity_score: number;
  cohesion_score: number;
  top_keywords: string[];
  common_questions: string[];
  evidence: CommentEvidence[];
};

export type CommentContentIdea = {
  topic: string;
  audience_problem: string;
  why_this_opportunity_exists: string;
  recommended_format: string;
  priority: "low" | "medium" | "high";
  demand_score: number;
  opportunity_score: number;
  supporting_comments: number;
  supporting_videos: number;
  ideas: Array<{
    title: string;
    angle: string;
    hook_type: string;
    why_it_matches_demand: string;
    thumbnail_angle: string;
  }>;
};

export type CommentAnalysisRequest = {
  videos: CommentVideoContext[];
  youtube_api_key?: string;
  mistral_api_key?: string;
  comment_limit_per_video: number;
  include_ai: boolean;
};

export type CommentAnalysisResponse = {
  metrics: {
    comments_analyzed: number;
    videos_analyzed: number;
    clusters_found: number;
    content_requests: number;
    questions: number;
    pain_points: number;
    positive: number;
    neutral: number;
    negative: number;
  };
  clusters: CommentCluster[];
  content_ideas: CommentContentIdea[];
  top_questions: string[];
  top_pain_points: string[];
  most_requested_content: string[];
  fetch_errors: Array<{ video_id: string; error: string }>;
  ai_error: string;
  processing_notes: string[];
};

export type ThumbnailAnalysis = {
  packaging_score: number;
  readability_score: number;
  visual_hierarchy_score: number;
  curiosity_score: number;
  clutter_score: number;
  mobile_readability_score: number;
  title_thumbnail_alignment_score: number;
  complementarity_score: number;
  redundancy_score: number;
};

export type TitleAnalysis = {
  clarity_score: number;
  curiosity_score: number;
  specificity_score: number;
  urgency_score: number;
  hook_type: string;
  orientation: string;
};

export type ContentOpportunity = {
  topic: string;
  opportunity_score: number;
  reason: string;
  evidence_count?: number;
  window?: string;
  label?: string;
};

export type InsightCell = string | number | boolean | null | undefined;
export type InsightRow = Record<string, InsightCell>;

export type VideosInsightRequest = {
  videos: Video[];
  own_channel_title?: string;
  query?: string;
  youtube_api_key?: string;
  search_seed_text?: string;
  enable_youtube_search?: boolean;
  search_days?: number;
  max_results_per_intent?: number;
  region_code?: string;
  relevance_language?: string;
  search_order?: "relevance" | "date" | "viewCount";
};

export type CompetitorInsightsResponse = {
  summary: InsightRow[];
  activity: Video[];
};

export type OutlierInsightsResponse = {
  metrics: Record<string, InsightCell>;
  videos: Video[];
};

export type TrendInsightsResponse = {
  trends: InsightRow[];
  keywords: InsightRow[];
  current_videos: Video[];
  search_trends: InsightRow[];
  search_evidence: InsightRow[];
  search_intents: string[];
  search_errors: string[];
  search_summary: InsightRow;
};

export type SeasonalityInsightsResponse = {
  opportunities: InsightRow[];
};

export type SearchDemandInsightsResponse = {
  keywords: InsightRow[];
  hooks: InsightRow[];
  gaps: InsightRow[];
};

export type OpportunityInsightsResponse = {
  opportunities: InsightRow[];
  content_gap_summary: InsightRow[];
};

export type TitleAnalyzeResponse = {
  title_analysis: InsightRow;
  fit_report: InsightRow;
  similar_patterns: InsightRow[];
};

export type ThumbnailAnalyzeResponse = {
  ok: boolean;
  error?: string;
  error_type?: string;
  packaging_score: number;
  validation: InsightRow & {
    valid?: boolean;
    errors?: string[];
    warnings?: string[];
  };
  analysis: InsightRow & {
    strengths?: string[];
    problems?: string[];
    recommendations?: string[];
  };
};
