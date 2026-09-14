"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import type { Video } from "@/types";

interface WhatToPostNextWidgetProps {
  videos?: Video[];
}

export function WhatToPostNextWidget({ videos }: WhatToPostNextWidgetProps) {
  // Sort videos by outlier score or views per day to rank high-potential topics
  const rankedList = (videos && videos.length)
    ? [...videos]
        .sort((a, b) => Number(b.outlier_score || b.views_per_day || 0) - Number(a.outlier_score || a.views_per_day || 0))
        .slice(0, 3)
    : [
        {
          title: "How to Create a High CTR Thumbnail in 2026",
          views_per_day: 4903,
          outlier_score: 2.8,
          video_id: "v1",
          url: "https://www.youtube.com",
        },
        {
          title: "How to Engage The Least Interested Viewers",
          views_per_day: 6100,
          outlier_score: 3.4,
          video_id: "v3",
          url: "https://www.youtube.com",
        },
        {
          title: "How to Return The Created Videos to Recommendations",
          views_per_day: 8900,
          outlier_score: 4.1,
          video_id: "v4",
          url: "https://www.youtube.com",
        },
      ];

  const maxViewsPerDay = Math.max(...rankedList.map((v) => Number(v.views_per_day || 1000)), 1000);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-base font-bold text-slate-800">What to Post Next</h3>
        <span className="text-xs font-semibold text-slate-500">Demand Progress</span>
      </div>

      <div className="space-y-3">
        {rankedList.map((item, index) => {
          const progress = Math.min(98, Math.max(45, Math.round(((Number(item.views_per_day || 1000)) / maxViewsPerDay) * 100)));
          const videoUrl = item.url || (item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : "#");

          return (
            <div
              key={item.video_id || index}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-100/80 transition-colors"
            >
              {/* Rank badge */}
              <span className="text-xs font-bold text-slate-700 w-4 text-center">{index + 1}</span>

              {/* Thumbnail Preview */}
              <div
                className={`size-10 shrink-0 rounded-lg bg-gradient-to-tr ${
                  index === 0
                    ? "from-blue-600 to-indigo-700"
                    : index === 1
                    ? "from-red-600 to-rose-700"
                    : "from-emerald-600 to-teal-700"
                } flex items-center justify-center text-[10px] font-black text-white shadow-xs overflow-hidden`}
              >
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="size-full object-cover" />
                ) : (
                  "YT"
                )}
              </div>

              {/* Title & Progress Bar */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate mb-1.5">{item.title}</p>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Proof Badge */}
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <CheckCircle2 className="size-3 fill-blue-600 text-white" />
                <span>Proof</span>
                <ExternalLink className="size-2.5 opacity-60" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
