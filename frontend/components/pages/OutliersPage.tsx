"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { MetricCard } from "@/components/cards/MetricCard";
import { VideoCard } from "@/components/cards/VideoCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NeedAnalysisState } from "@/components/pages/NeedAnalysisState";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { getOutliers } from "@/lib/api";
import { formatCompactNumber } from "@/lib/utils";
import type { OutlierInsightsResponse } from "@/types";

export function OutliersPage() {
  const channelState = useChannelAnalysisContext();
  const [data, setData] = useState<OutlierInsightsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!channelState.result) return;
    getOutliers({ videos: channelState.result.all_videos, own_channel_title: channelState.result.own_channel.title })
      .then(setData)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Outlier analysis failed"));
  }, [channelState.result]);

  return (
    <PageContainer eyebrow="Research" title="Outliers" description="High-performing videos ranked by views/day and outlier score.">
      {!channelState.result ? <NeedAnalysisState /> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Outliers" value={formatCompactNumber(Number(data.metrics.total_outliers ?? 0))} icon={Trophy} />
            <MetricCard label="Super Outliers" value={formatCompactNumber(Number(data.metrics.super_outliers ?? 0))} />
            <MetricCard label="Median Score" value={String(data.metrics.median_outlier_score ?? "-")} />
            <MetricCard label="Top Topic" value={String(data.metrics.top_topic ?? "-")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.videos.map((video) => <VideoCard key={video.video_id ?? `${video.title}`} video={video} />)}
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}

