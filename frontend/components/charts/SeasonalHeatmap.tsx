import { Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { SeasonalOpportunity } from "@/types";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function SeasonalHeatmap({ opportunities = [] }: { opportunities?: SeasonalOpportunity[] }) {
  const topics = [...new Set(opportunities.map((item) => item.topic))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>12-Month Topic Heatmap</CardTitle>
        <p className="mt-1 text-sm text-muted">Month-wise demand signals from your analyzed videos.</p>
      </CardHeader>
      <CardContent>
        {topics.length ? (
          <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-[180px_repeat(12,1fr)] gap-1 text-xs">
              <div />
              {months.map((month) => (
                <div key={month} className="px-2 py-2 text-center text-muted">
                  {month}
                </div>
              ))}
              {topics.map((topic) => (
                <Fragment key={topic}>
                  <div className="px-2 py-2 font-medium text-foreground">
                    {topic}
                  </div>
                  {months.map((month) => {
                    const score =
                      opportunities.find((item) => item.topic === topic && item.month === month)
                        ?.opportunity_score ?? 0;
                    return (
                      <div
                        key={`${topic}-${month}`}
                        className="rounded-lg border border-border px-2 py-2 text-center text-muted"
                        style={{ backgroundColor: `rgba(255, 59, 92, ${Math.min(score, 100) / 180})` }}
                      >
                        {score || "-"}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
            Run channel analysis to build the seasonal heatmap.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
