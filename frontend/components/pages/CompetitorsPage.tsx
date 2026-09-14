"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { VideoCard } from "@/components/cards/VideoCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NeedAnalysisState } from "@/components/pages/NeedAnalysisState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { compareCompetitors } from "@/lib/api";
import { formatCompactNumber } from "@/lib/utils";
import type { CompetitorInsightsResponse } from "@/types";

export function CompetitorsPage() {
  const channelState = useChannelAnalysisContext();
  const [data, setData] = useState<CompetitorInsightsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!channelState.result) return;
    compareCompetitors({
      videos: channelState.result.all_videos,
      own_channel_title: channelState.result.own_channel.title,
    })
      .then(setData)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Competitor analysis failed"));
  }, [channelState.result]);

  return (
    <PageContainer
      eyebrow="Research"
      title="Competitor Intelligence"
      description="Compare upload activity, total views, median views, views/day, and outlier rate from analyzed channels."
    >
      {!channelState.result ? <NeedAnalysisState /> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Channels" value={formatCompactNumber(data.summary.length)} icon={Users} />
            <MetricCard label="Activity Items" value={formatCompactNumber(data.activity.length)} />
            <MetricCard label="Competitor Videos" value={formatCompactNumber(channelState.result?.competitor_videos.length)} />
            <MetricCard label="Own Videos" value={formatCompactNumber(channelState.result?.own_videos.length)} />
          </div>
          <Card>
            <CardHeader><CardTitle>Channel Comparison</CardTitle></CardHeader>
            <CardContent><DataTable rows={data.summary} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent Competitor Activity</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.activity.slice(0, 12).map((video) => (
                <VideoCard key={video.video_id ?? `${video.title}-${video.upload_date}`} video={video} />
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </PageContainer>
  );
}

