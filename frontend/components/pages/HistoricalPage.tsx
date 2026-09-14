"use client";

import { History } from "lucide-react";
import { MetricCard } from "@/components/cards/MetricCard";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { PageContainer } from "@/components/layout/PageContainer";
import { NeedAnalysisState } from "@/components/pages/NeedAnalysisState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { formatCompactNumber } from "@/lib/utils";

export function HistoricalPage() {
  const channelState = useChannelAnalysisContext();
  const videos = channelState.result?.all_videos ?? [];
  const monthly = Object.values(
    videos.reduce<Record<string, { month: string; videos: number; views: number }>>((acc, video) => {
      const month = (video.upload_date || "").slice(0, 7) || "unknown";
      acc[month] = acc[month] || { month, videos: 0, views: 0 };
      acc[month].videos += 1;
      acc[month].views += Number(video.views ?? 0);
      return acc;
    }, {}),
  ).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <PageContainer eyebrow="Track" title="Historical Data" description="Upload and view history from the selected Dashboard date range.">
      {!channelState.result ? <NeedAnalysisState /> : null}
      {channelState.result ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Months" value={formatCompactNumber(monthly.length)} icon={History} />
            <MetricCard label="Videos" value={formatCompactNumber(videos.length)} />
            <MetricCard label="Views" value={formatCompactNumber(videos.reduce((sum, video) => sum + Number(video.views ?? 0), 0))} />
          </div>
          <GrowthChart videos={videos} />
          <Card><CardHeader><CardTitle>Month-wise Upload Data</CardTitle></CardHeader><CardContent><DataTable rows={monthly} /></CardContent></Card>
        </>
      ) : null}
    </PageContainer>
  );
}

