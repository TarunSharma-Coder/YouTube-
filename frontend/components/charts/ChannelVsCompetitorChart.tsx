"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Video } from "@/types";

interface ChannelVsCompetitorChartProps {
  videos?: Video[];
  ownChannelName?: string;
}

const mockChartData = [
  { month: "Jan", ownChannel: 10, competitorAvg: 8 },
  { month: "Feb", ownChannel: 35, competitorAvg: 22 },
  { month: "Mar", ownChannel: 45, competitorAvg: 28 },
  { month: "Apr", ownChannel: 58, competitorAvg: 24 },
  { month: "Jun", ownChannel: 92, competitorAvg: 75 },
  { month: "Jul", ownChannel: 84, competitorAvg: 62 },
  { month: "Aug", ownChannel: 110, competitorAvg: 78 },
];

export function ChannelVsCompetitorChart({ videos, ownChannelName = "@TechExplorer" }: ChannelVsCompetitorChartProps) {
  const chartData = useMemo(() => {
    if (!videos || !videos.length) return mockChartData;

    const monthMap = new Map<string, { ownSum: number; ownCount: number; compSum: number; compCount: number }>();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    videos.forEach((v) => {
      if (!v.upload_date) return;
      const d = new Date(v.upload_date);
      if (isNaN(d.getTime())) return;
      const monthLabel = monthNames[d.getMonth()];
      const views = Number(v.views || 0);

      const existing = monthMap.get(monthLabel) || { ownSum: 0, ownCount: 0, compSum: 0, compCount: 0 };
      const isOwn = v.channel?.toLowerCase() === ownChannelName.toLowerCase() || v.channel?.includes("TechExplorer");

      if (isOwn) {
        existing.ownSum += views;
        existing.ownCount += 1;
      } else {
        existing.compSum += views;
        existing.compCount += 1;
      }
      monthMap.set(monthLabel, existing);
    });

    if (!monthMap.size) return mockChartData;

    return Array.from(monthMap.entries()).map(([month, val]) => ({
      month,
      ownChannel: val.ownCount ? Math.round(val.ownSum / (val.ownCount * 1000)) : 10,
      competitorAvg: val.compCount ? Math.round(val.compSum / (val.compCount * 1000)) : 8,
    }));
  }, [videos, ownChannelName]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Channel vs competitors</h3>
          <p className="text-xs text-slate-500">Monthly average view volume in thousands (K views)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-600" />
            <span className="text-slate-600">YouTube Red (Your Channel)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-600">Royal Blue (Competitors)</span>
          </div>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value}K views`, ""]}
            />

            <Area
              type="monotone"
              dataKey="competitorAvg"
              name="Royal Blue"
              stroke="#2563EB"
              strokeWidth={3}
              fill="url(#blueGradient)"
            />
            <Area
              type="monotone"
              dataKey="ownChannel"
              name="YouTube Red"
              stroke="#DC2626"
              strokeWidth={3}
              fill="url(#redGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
