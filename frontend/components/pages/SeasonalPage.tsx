"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NeedAnalysisState } from "@/components/pages/NeedAnalysisState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { getSeasonality } from "@/lib/api";
import { formatCompactNumber } from "@/lib/utils";
import type { SeasonalityInsightsResponse } from "@/types";

export function SeasonalPage() {
  const channelState = useChannelAnalysisContext();
  const [data, setData] = useState<SeasonalityInsightsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!channelState.result) return;
    getSeasonality({ videos: channelState.result.all_videos, own_channel_title: channelState.result.own_channel.title })
      .then(setData)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Seasonality analysis failed"));
  }, [channelState.result]);

  const highDemand = data?.opportunities.filter((row) => Number(row.demand_score ?? 0) >= 70).length ?? 0;

  return (
    <PageContainer eyebrow="Research" title="Seasonal Intelligence" description="Month-wise topic demand, competitor supply, and recommended publishing windows.">
      {!channelState.result ? <NeedAnalysisState /> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Seasonal Topics" value={formatCompactNumber(data.opportunities.length)} icon={Flame} />
            <MetricCard label="High Demand" value={formatCompactNumber(highDemand)} />
            <MetricCard label="Best Score" value={String(Math.max(0, ...data.opportunities.map((row) => Number(row.demand_score ?? 0))))} />
          </div>
          <Card><CardHeader><CardTitle>12-Month Topic Opportunity Sheet</CardTitle></CardHeader><CardContent><DataTable rows={data.opportunities} limit={120} /></CardContent></Card>
        </>
      ) : null}
    </PageContainer>
  );
}

