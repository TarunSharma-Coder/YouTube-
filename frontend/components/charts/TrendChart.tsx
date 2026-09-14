"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type TrendChartProps = {
  data?: Array<Record<string, string | number | boolean | null | undefined>>;
};

export function TrendChart({ data = [] }: TrendChartProps) {
  const chartData = data
    .map((row) => ({
      topic: String(row.topic ?? row.keyword ?? row.search_intent ?? "Topic"),
      score: Number(row.trend_score ?? row.opportunity_score ?? row.views ?? 0),
    }))
    .filter((row) => row.score > 0)
    .slice(0, 12);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Chart</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                <XAxis dataKey="topic" stroke="#8B93A1" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8B93A1" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#12151A",
                    border: "1px solid #252930",
                    borderRadius: "12px",
                    color: "#F5F7FA",
                  }}
                />
                <Bar dataKey="score" fill="#FF3B5C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
            Run channel analysis to build the trend chart.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis };
