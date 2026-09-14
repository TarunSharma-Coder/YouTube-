"use client";

import { FormEvent, useState } from "react";
import { Type } from "lucide-react";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NeedAnalysisState } from "@/components/pages/NeedAnalysisState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { analyzeTitle } from "@/lib/api";
import type { TitleAnalyzeResponse } from "@/types";

export function TitleAnalyzerUI() {
  const channelState = useChannelAnalysisContext();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TitleAnalyzeResponse | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await analyzeTitle({
        title,
        videos: channelState.result?.all_videos ?? [],
        own_channel_title: channelState.result?.own_channel.title ?? "",
      });
      setResult(response);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Title analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer eyebrow="Create" title="Title Analyzer" description="Analyze a proposed title against your current channel and competitor dataset.">
      {!channelState.result ? <NeedAnalysisState /> : null}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Type className="size-5 text-accent" /> Proposed Title</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-[1fr_160px] md:items-end">
            <label className="block text-sm font-medium text-foreground">
              Title
              <Input value={title} onChange={(event) => setTitle(event.target.value)} required className="mt-2" placeholder="Enter your next YouTube title" />
            </label>
            <Button disabled={loading || !title.trim()}>{loading ? "Analyzing..." : "Analyze"}</Button>
          </form>
        </CardContent>
      </Card>
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      {result ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Clarity" value={`${result.title_analysis.clarity_score ?? "-"}/10`} />
            <MetricCard label="Curiosity" value={`${result.title_analysis.curiosity_score ?? "-"}/10`} />
            <MetricCard label="Specificity" value={`${result.title_analysis.specificity_score ?? "-"}/10`} />
            <MetricCard label="Urgency" value={`${result.title_analysis.urgency_score ?? "-"}/10`} />
          </div>
          <Card><CardHeader><CardTitle>Title Analysis</CardTitle></CardHeader><CardContent><DataTable rows={[result.title_analysis]} /></CardContent></Card>
          <Card><CardHeader><CardTitle>YouTube Data Fit</CardTitle></CardHeader><CardContent><DataTable rows={[result.fit_report]} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Similar Winning Patterns</CardTitle></CardHeader><CardContent><DataTable rows={result.similar_patterns} /></CardContent></Card>
        </>
      ) : null}
    </PageContainer>
  );
}

