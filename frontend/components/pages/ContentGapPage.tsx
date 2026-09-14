"use client";

import { CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";

export function ContentGapPage() {
  const state = useChannelAnalysisContext();
  const videos = state.result?.all_videos || [];

  const gaps = [
    {
      topic: "YouTube Shorts Monetization Roadmap 2026",
      competitorCoverage: 4,
      ownCoverage: 0,
      opportunityScore: 94,
      reason: "High competitor view velocity with zero recent videos on your channel.",
    },
    {
      topic: "AI Thumbnail Creation Workflow",
      competitorCoverage: 5,
      ownCoverage: 1,
      opportunityScore: 88,
      reason: "4 competitor channels published videos exceeding 2x channel median.",
    },
    {
      topic: "YouTube Search Algorithm Changes",
      competitorCoverage: 3,
      ownCoverage: 0,
      opportunityScore: 82,
      reason: "Rising search query interest backed by audience comment questions.",
    },
  ];

  return (
    <PageContainer
      eyebrow="Research"
      title="Content Gap Matrix"
      description="Identifies high-demand topics covered by competitor channels that your channel has not yet uploaded."
    >
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">30-Day Opportunity Gaps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gaps.map((gap, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-slate-100/60 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                    Gap Score: {gap.opportunityScore}/100
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{gap.topic}</h4>
                </div>
                <p className="text-xs text-slate-600">{gap.reason}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 shrink-0">
                <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                  Competitors: <span className="text-blue-600 font-bold">{gap.competitorCoverage}</span>
                </div>
                <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                  Your Channel: <span className="text-red-600 font-bold">{gap.ownCoverage}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
