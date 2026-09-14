import type {
  ChannelAnalysisRequest,
  ChannelAnalysisResponse,
  CommentAnalysisRequest,
  CommentAnalysisResponse,
  CompetitorInsightsResponse,
  OpportunityInsightsResponse,
  OutlierInsightsResponse,
  SearchDemandInsightsResponse,
  SeasonalityInsightsResponse,
  ThumbnailAnalyzeResponse,
  TitleAnalyzeResponse,
  TrendInsightsResponse,
  VideosInsightRequest,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function requestJson<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body && typeof body === "object" && "detail" in body ? body.detail : null;
    throw new Error(String(detail ?? `Backend request failed with status ${response.status}`));
  }

  return response.json() as Promise<TResponse>;
}

async function requestForm<TResponse>(path: string, formData: FormData): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body && typeof body === "object" && "detail" in body ? body.detail : null;
    throw new Error(String(detail ?? `Backend request failed with status ${response.status}`));
  }

  return response.json() as Promise<TResponse>;
}

export function analyzeChannel(payload: ChannelAnalysisRequest) {
  return requestJson<ChannelAnalysisResponse>("/api/channel-analysis", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const runChannelAnalysis = analyzeChannel;

function postInsight<TResponse>(path: string, payload: VideosInsightRequest): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function compareCompetitors(payload: VideosInsightRequest): Promise<CompetitorInsightsResponse> {
  return postInsight("/api/insights/competitors", payload);
}

export function getOutliers(payload: VideosInsightRequest): Promise<OutlierInsightsResponse> {
  return postInsight("/api/insights/outliers", payload);
}

export function getTrends(payload: VideosInsightRequest): Promise<TrendInsightsResponse> {
  return postInsight("/api/insights/trends", payload);
}

export function getSeasonality(payload: VideosInsightRequest): Promise<SeasonalityInsightsResponse> {
  return postInsight("/api/insights/seasonality", payload);
}

export function getSearchDemand(payload: VideosInsightRequest): Promise<SearchDemandInsightsResponse> {
  return postInsight("/api/insights/search-demand", payload);
}

export function analyzeComments(payload: CommentAnalysisRequest): Promise<CommentAnalysisResponse> {
  return requestJson<CommentAnalysisResponse>("/api/comments/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function analyzeThumbnail(formData: FormData): Promise<ThumbnailAnalyzeResponse> {
  return requestForm<ThumbnailAnalyzeResponse>("/api/insights/thumbnail/analyze", formData);
}

export function analyzeTitle(
  payload: VideosInsightRequest & { title: string; packaging_score?: number },
): Promise<TitleAnalyzeResponse> {
  return requestJson<TitleAnalyzeResponse>("/api/insights/title/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getOpportunities(payload: VideosInsightRequest): Promise<OpportunityInsightsResponse> {
  return postInsight("/api/insights/opportunities", payload);
}
