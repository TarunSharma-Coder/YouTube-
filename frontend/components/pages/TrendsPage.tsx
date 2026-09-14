"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/cards/MetricCard";
import { VideoCard } from "@/components/cards/VideoCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NeedAnalysisState } from "@/components/pages/NeedAnalysisState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input, Textarea } from "@/components/ui/Input";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { getTrends } from "@/lib/api";
import { formatCompactNumber } from "@/lib/utils";
import type { TrendInsightsResponse } from "@/types";

export function TrendsPage() {
  const channelState = useChannelAnalysisContext();
  const [data, setData] = useState<TrendInsightsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enableYoutubeSearch, setEnableYoutubeSearch] = useState(false);
  const [searchSeedText, setSearchSeedText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDays, setSearchDays] = useState(30);
  const [maxResultsPerIntent, setMaxResultsPerIntent] = useState(8);

  const runTrendAnalysis = () => {
    if (!channelState.result) return;
    setLoading(true);
    setError("");
    getTrends({
      videos: channelState.result.all_videos,
      own_channel_title: channelState.result.own_channel.title,
      youtube_api_key: channelState.youtubeApiKey || undefined,
      query: searchQuery,
      search_seed_text: searchSeedText,
      enable_youtube_search: enableYoutubeSearch,
      search_days: searchDays,
      max_results_per_intent: maxResultsPerIntent,
      region_code: "IN",
      relevance_language: "en",
      search_order: "relevance",
    })
      .then(setData)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Trend analysis failed"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runTrendAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelState.result]);

  const searchTrendCount = data?.search_trends?.length ?? 0;
  const marketVideosSampled = Number(data?.search_summary?.market_videos_sampled ?? 0);
  const exactVolumeNote = String(
    data?.search_summary?.search_volume_note ??
      "YouTube Data API does not provide exact audience search volume. This feature estimates demand from recent YouTube search-result performance.",
  );
  const nicheKeywords = String(data?.search_summary?.niche_keywords ?? "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return (
    <PageContainer
      eyebrow="Research"
      title="Trends Intelligence"
      description="Topic momentum from your analyzed channels, plus optional YouTube search demand proxy for niche-relevant audience searches."
    >
      {!channelState.result ? <NeedAnalysisState /> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      {channelState.result ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>YouTube Search Trend Finder</CardTitle>
                <p className="mt-1 text-sm text-muted">
                  Find related searches and market videos for the same niche as your selected channel data.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={enableYoutubeSearch}
                  onChange={(event) => setEnableYoutubeSearch(event.target.checked)}
                  className="size-4 rounded border-border bg-surface-2 accent-accent"
                />
                Use live YouTube search
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-surface-2 p-3 text-xs leading-5 text-muted">
              {exactVolumeNote}
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Audience topic or video idea</span>
                <Textarea
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  rows={3}
                  placeholder="Example: CAT 2026 preparation strategy, MBA entrance exam study plan"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Seed searches</span>
                <Textarea
                  value={searchSeedText}
                  onChange={(event) => setSearchSeedText(event.target.value)}
                  rows={3}
                  placeholder="One search per line, or comma separated"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Lookback days</span>
                  <Input
                    type="number"
                    min={1}
                    max={180}
                    value={searchDays}
                    onChange={(event) => setSearchDays(Number(event.target.value))}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Videos per search</span>
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    value={maxResultsPerIntent}
                    onChange={(event) => setMaxResultsPerIntent(Number(event.target.value))}
                  />
                </label>
              </div>
            </div>
            <Button type="button" onClick={runTrendAnalysis} disabled={loading} className="w-full sm:w-auto">
              {loading ? <RefreshCw className="size-4 animate-spin" /> : <Search className="size-4" />}
              {enableYoutubeSearch ? "Refresh trends and searches" : "Refresh channel trends"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
      {data ? (
        <>
          {data.search_errors?.length ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              {data.search_errors.slice(0, 3).map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            <MetricCard label="Trend Topics" value={formatCompactNumber(data.trends.length)} icon={TrendingUp} />
            <MetricCard label="Trend Keywords" value={formatCompactNumber(data.keywords.length)} />
            <MetricCard label="Current Videos" value={formatCompactNumber(data.current_videos.length)} />
            <MetricCard label="Related Searches" value={formatCompactNumber(searchTrendCount)} />
            <MetricCard label="Market Videos" value={formatCompactNumber(marketVideosSampled)} />
          </div>
          {data.search_intents?.length ? (
            <Card>
              <CardHeader><CardTitle>Detected Search Intents</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.search_intents.map((intent) => (
                    <span key={intent} className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
                      {intent}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
          {nicheKeywords.length ? (
            <Card>
              <CardHeader><CardTitle>Niche Keywords Used For Filtering</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {nicheKeywords.map((keyword) => (
                    <span key={keyword} className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Related YouTube Search Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable rows={data.search_trends ?? []} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Search Evidence Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable rows={data.search_evidence ?? []} />
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>Trend Table</CardTitle></CardHeader><CardContent><DataTable rows={data.trends} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Trending Keywords</CardTitle></CardHeader><CardContent><DataTable rows={data.keywords} /></CardContent></Card>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.current_videos.slice(0, 9).map((video) => <VideoCard key={video.video_id ?? `${video.title}`} video={video} />)}
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
