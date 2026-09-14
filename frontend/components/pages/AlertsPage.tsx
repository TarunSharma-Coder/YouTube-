"use client";

import { Bell } from "lucide-react";
import { VideoCard } from "@/components/cards/VideoCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NeedAnalysisState } from "@/components/pages/NeedAnalysisState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";

export function AlertsPage() {
  const channelState = useChannelAnalysisContext();
  const videos = [...(channelState.result?.all_videos ?? [])]
    .sort((a, b) => Number(b.views_per_day ?? b.views ?? 0) - Number(a.views_per_day ?? a.views ?? 0))
    .slice(0, 12);

  return (
    <PageContainer eyebrow="Track" title="Alerts" description="Fast-moving videos and high-priority items from your latest analysis run.">
      {!channelState.result ? <NeedAnalysisState /> : null}
      {channelState.result ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="size-5 text-accent" /> Watchlist</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => <VideoCard key={video.video_id ?? `${video.title}`} video={video} />)}
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}

