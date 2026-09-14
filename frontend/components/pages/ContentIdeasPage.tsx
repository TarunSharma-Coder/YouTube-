"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NeedAnalysisState } from "@/components/pages/NeedAnalysisState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { getOpportunities } from "@/lib/api";
import { formatCompactNumber } from "@/lib/utils";
import type { OpportunityInsightsResponse } from "@/types";

export function ContentIdeasPage() {
  const channelState = useChannelAnalysisContext();
  const [data, setData] = useState<OpportunityInsightsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!channelState.result) return;
    getOpportunities({ videos: channelState.result.all_videos, own_channel_title: channelState.result.own_channel.title })
      .then(setData)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Content ideas failed"));
  }, [channelState.result]);

  return (
    <PageContainer eyebrow="Create" title="Content Ideas" description="What to post next based on trends, gaps, outliers, and competitor/channel signals.">
      {!channelState.result ? <NeedAnalysisState /> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard label="Recommendations" value={formatCompactNumber(data.opportunities.length)} icon={Lightbulb} />
            <MetricCard label="Gap Rows" value={formatCompactNumber(data.content_gap_summary.length)} />
          </div>
          <Card><CardHeader><CardTitle>Opportunity Feed</CardTitle></CardHeader><CardContent><DataTable rows={data.opportunities} limit={30} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Content Gap Summary</CardTitle></CardHeader><CardContent><DataTable rows={data.content_gap_summary} /></CardContent></Card>
        </>
      ) : null}
    </PageContainer>
  );
}

