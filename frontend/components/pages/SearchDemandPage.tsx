"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NeedAnalysisState } from "@/components/pages/NeedAnalysisState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { getSearchDemand } from "@/lib/api";
import { formatCompactNumber } from "@/lib/utils";
import type { SearchDemandInsightsResponse } from "@/types";

export function SearchDemandPage() {
  const channelState = useChannelAnalysisContext();
  const [data, setData] = useState<SearchDemandInsightsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!channelState.result) return;
    getSearchDemand({ videos: channelState.result.all_videos, own_channel_title: channelState.result.own_channel.title })
      .then(setData)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Search demand analysis failed"));
  }, [channelState.result]);

  return (
    <PageContainer eyebrow="Audience" title="Search Demand" description="Keyword, hook, and content-gap signals from analyzed channel and competitor data.">
      {!channelState.result ? <NeedAnalysisState /> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Keywords" value={formatCompactNumber(data.keywords.length)} icon={Search} />
            <MetricCard label="Hooks" value={formatCompactNumber(data.hooks.length)} />
            <MetricCard label="Content Gaps" value={formatCompactNumber(data.gaps.length)} />
          </div>
          <Card><CardHeader><CardTitle>Keyword Demand</CardTitle></CardHeader><CardContent><DataTable rows={data.keywords} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Hook Words</CardTitle></CardHeader><CardContent><DataTable rows={data.hooks} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Content Gaps</CardTitle></CardHeader><CardContent><DataTable rows={data.gaps} /></CardContent></Card>
        </>
      ) : null}
    </PageContainer>
  );
}

