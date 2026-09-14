"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { VideoCard } from "@/components/cards/VideoCard";
import { ChannelVsCompetitorChart } from "@/components/charts/ChannelVsCompetitorChart";
import { ThumbnailTitleAIWidget } from "@/components/cards/ThumbnailTitleAIWidget";
import { WhatToPostNextWidget } from "@/components/cards/WhatToPostNextWidget";
import { RadialGauge } from "@/components/ui/RadialGauge";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { formatCompactNumber } from "@/lib/utils";
import type { Video } from "@/types";

function sortedTopVideos(videos: Video[]) {
  return [...videos]
    .sort((a, b) => Number(b.outlier_score ?? b.views ?? 0) - Number(a.outlier_score ?? a.views ?? 0))
    .slice(0, 6);
}

function AnalysisForm({ state }: { state: ReturnType<typeof useChannelAnalysisContext> }) {
  const [open, setOpen] = useState(false);

  return (
    <Card id="analysis-form-card" className="border-border shadow-xs bg-white">
      <CardHeader
        className="cursor-pointer flex flex-row items-center justify-between py-4"
        onClick={() => setOpen(!open)}
      >
        <div>
          <CardTitle className="text-base font-bold text-slate-800">Analyze Channels & Connect YouTube API</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure target channel, competitor URLs, and date ranges for live FastAPI analysis.
          </p>
        </div>
        <Button variant="secondary" className="gap-2 text-xs py-1.5 px-3">
          <span>{open ? "Collapse Form" : "Open Settings"}</span>
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </CardHeader>

      {open ? (
        <CardContent className="border-t border-slate-100 pt-4">
          <form className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_160px] xl:items-end" onSubmit={state.submit}>
            <label className="block text-xs font-semibold text-slate-700">
              Your channel URL
              <Input
                value={state.ownChannelUrl}
                onChange={(event) => state.setOwnChannelUrl(event.target.value)}
                placeholder="https://www.youtube.com/@YourChannel"
                required
                className="mt-1.5"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700 xl:row-span-2">
              Competitor URLs (Up to 5)
              <Textarea
                value={state.competitors}
                onChange={(event) => state.setCompetitors(event.target.value)}
                placeholder={"https://www.youtube.com/@Competitor1\nhttps://www.youtube.com/@Competitor2"}
                className="mt-1.5 min-h-28"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              YouTube API key
              <Input
                value={state.youtubeApiKey}
                onChange={(event) => state.setYoutubeApiKey(event.target.value)}
                placeholder="Optional if backend .env has key"
                type="password"
                className="mt-1.5"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Max videos/channel
              <Input
                type="number"
                min={1}
                max={2000}
                value={state.maxVideos}
                onChange={(event) => state.setMaxVideos(Number(event.target.value))}
                className="mt-1.5"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Start date
              <Input
                type="date"
                value={state.startDate}
                onChange={(event) => state.setStartDate(event.target.value)}
                className="mt-1.5"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              End date
              <Input
                type="date"
                value={state.endDate}
                onChange={(event) => state.setEndDate(event.target.value)}
                className="mt-1.5"
              />
            </label>
            <Button type="submit" disabled={state.loading} className="h-10 bg-accent hover:bg-red-700 text-white font-bold">
              {state.loading ? "Analyzing..." : "Analyze Channels"}
            </Button>
          </form>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function OverviewPage() {
  const state = useChannelAnalysisContext();
  const result = state.result;
  const topVideos = sortedTopVideos(result?.all_videos ?? []);

  // Compute dynamic metrics based on result state
  const metrics = useMemo(() => {
    const ownSummary = result?.summary?.[0];
    const avgViewsPerDay = ownSummary?.avg_views_per_day
      ? Math.round(ownSummary.avg_views_per_day)
      : 4903;

    const velocityChange = ownSummary ? Math.min(99, Math.max(12, Math.round((avgViewsPerDay / 100)))) : 48;

    const ownVideos = result?.own_videos || [];
    const avgTitleLength = ownVideos.length
      ? ownVideos.reduce((acc, v) => acc + (v.title?.length || 0), 0) / ownVideos.length
      : 55;
    const packagingScore = Math.min(98, Math.max(65, Math.round(100 - Math.abs(avgTitleLength - 50) * 0.8)));

    const audienceDemandScore = state.totals.videos
      ? Math.min(99, Math.max(60, Math.round(70 + state.totals.outliers * 6)))
      : 96;

    return {
      avgViewsPerDay,
      velocityChange,
      packagingScore,
      audienceDemandScore,
    };
  }, [result, state.totals]);

  return (
    <PageContainer
      eyebrow="Dashboard"
      title="YouTube Growth Studio AI"
      description="Real-time YouTube channel performance, packaging AI score, audience demand, and growth recommendations."
    >
      {/* Interactive Form Trigger Drawer */}
      <AnalysisForm state={state} />

      {state.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      {/* Row 1: Dynamic Key Metric Cards (Matches Mockup Screenshot) */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Card 1: View Velocity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-bold text-slate-800">View Velocity</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-200">
              +{metrics.velocityChange}%
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">+{metrics.velocityChange}%</p>
            <p className="mt-1 text-xs font-medium text-slate-500">View Velocity in {formatCompactNumber(metrics.avgViewsPerDay)}</p>
          </div>
        </div>

        {/* Card 2: Packaging Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-slate-800 block mb-2">Packaging Score</span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.packagingScore}/100</p>
            <p className="mt-1 text-xs font-medium text-slate-500">Radial Meter</p>
          </div>
          <RadialGauge score={metrics.packagingScore} size={76} strokeWidth={8} />
        </div>

        {/* Card 3: Audience Demand */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-bold text-slate-800">Audience Demand</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-200">
              {metrics.audienceDemandScore}% High
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.audienceDemandScore}% High</p>
            <p className="mt-1 text-xs font-medium text-slate-500 mb-2">Audience Demand Progress</p>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${metrics.audienceDemandScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Dynamic Channel vs Competitors Line Chart */}
      <ChannelVsCompetitorChart
        videos={result?.all_videos}
        ownChannelName={result?.own_channel?.title || "@TechExplorer"}
      />

      {/* Row 3: Dynamic Split Columns (Thumbnail & Title AI + What to Post Next) */}
      <div className="grid gap-5 xl:grid-cols-2">
        <ThumbnailTitleAIWidget topVideo={topVideos[0]} allVideos={result?.all_videos} />
        <WhatToPostNextWidget videos={result?.all_videos} />
      </div>

      {/* Competitor Benchmark Data Table (Full Feature Parity) */}
      {result?.summary.length ? (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Competitor Performance Table</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="border-b border-slate-200 text-left font-semibold uppercase tracking-wider text-slate-400 bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Videos</th>
                  <th className="px-4 py-3">Total Views</th>
                  <th className="px-4 py-3">Avg Views</th>
                  <th className="px-4 py-3">Avg Views/Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.summary.map((row) => (
                  <tr key={row.channel_id || row.channel} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{row.channel}</td>
                    <td className="px-4 py-3 font-medium text-slate-600">{formatCompactNumber(row.videos)}</td>
                    <td className="px-4 py-3 font-medium text-slate-600">{formatCompactNumber(row.total_views)}</td>
                    <td className="px-4 py-3 font-medium text-slate-600">{formatCompactNumber(row.avg_views)}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{formatCompactNumber(row.avg_views_per_day)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {/* Top Analyzed Videos Grid */}
      {topVideos.length ? (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Recent Outlier & Top Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topVideos.map((video) => (
                <VideoCard key={video.video_id ?? `${video.title}-${video.upload_date}`} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
