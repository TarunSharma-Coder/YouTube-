"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCompactNumber } from "@/lib/utils";
import type { Video } from "@/types";

type GrowthPoint = {
  date: string;
  views: number;
  uploads: number;
};

function buildGrowthData(videos: Video[]): GrowthPoint[] {
  const grouped = new Map<string, GrowthPoint>();
  videos.forEach((video) => {
    const rawDate = video.upload_date;
    if (!rawDate) return;
    const date = rawDate.slice(0, 10);
    const existing = grouped.get(date) ?? { date, views: 0, uploads: 0 };
    existing.views += Number(video.views ?? 0);
    existing.uploads += 1;
    grouped.set(date, existing);
  });
  return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function GrowthChart({ videos }: { videos: Video[] }) {
  const data = buildGrowthData(videos);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Channel Growth View</CardTitle>
          <p className="mt-1 text-sm text-muted">Views and upload activity from analyzed videos.</p>
        </div>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B5C" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FF3B5C" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#252930" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#8B93A1" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#8B93A1"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCompactNumber(Number(value))}
                />
                <Tooltip
                  contentStyle={{
                    background: "#12151A",
                    border: "1px solid #252930",
                    borderRadius: "12px",
                    color: "#F5F7FA",
                  }}
                  formatter={(value, name) => [
                    name === "views" ? formatCompactNumber(Number(value)) : value,
                    name === "views" ? "Views" : "Uploads",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#FF3B5C"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[360px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
            Run channel analysis to build the growth chart.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

