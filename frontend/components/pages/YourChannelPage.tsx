"use client";

import { useState } from "react";
import { Film, Eye, Flame, Filter, ExternalLink } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { formatCompactNumber } from "@/lib/utils";

export function YourChannelPage() {
  const state = useChannelAnalysisContext();
  const ownChannel = state.result?.own_channel;
  const ownVideos = state.result?.own_videos || [];
  const [filterType, setFilterType] = useState<"all" | "long" | "Shorts">("all");

  const filteredVideos = ownVideos.filter((v) => {
    if (filterType === "all") return true;
    if (filterType === "Shorts") return v.video_type === "Shorts" || (v.duration_minutes && v.duration_minutes <= 1);
    return v.video_type !== "Shorts" && (!v.duration_minutes || v.duration_minutes > 1);
  });

  return (
    <PageContainer
      eyebrow="Your Channel"
      title={ownChannel?.title || "@TechExplorer"}
      description="Date-range video performance breakdown, title metrics, velocity, and Shorts vs Long-form video filters."
    >
      {/* Channel Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {ownChannel?.title?.[1]?.toUpperCase() || "YT"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{ownChannel?.title || "@TechExplorer"}</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{ownChannel?.description || "Tech & Growth Intelligence Tutorials"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Subscribers</span>
            <span className="text-base font-extrabold text-slate-800">{formatCompactNumber(ownChannel?.subscriber_count || 148000)}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Views</span>
            <span className="text-base font-extrabold text-slate-800">{formatCompactNumber(ownChannel?.view_count || 14200000)}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Analyzed Videos</span>
            <span className="text-base font-extrabold text-blue-600">{ownVideos.length}</span>
          </div>
        </div>
      </div>

      {/* Video Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Videos ({ownVideos.length})
          </button>
          <button
            onClick={() => setFilterType("long")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === "long" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Long Videos
          </button>
          <button
            onClick={() => setFilterType("Shorts")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === "Shorts" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Shorts
          </button>
        </div>
      </div>

      {/* Videos Data Table */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">Analyzed Video List</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="border-b border-slate-200 text-left font-semibold uppercase tracking-wider text-slate-400 bg-slate-50">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Views / Day</th>
                <th className="px-4 py-3">Upload Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVideos.map((v) => (
                <tr key={v.video_id || v.title} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800 max-w-xs truncate">{v.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        v.video_type === "Shorts"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-blue-50 text-blue-600 border-blue-200"
                      }`}
                    >
                      {v.video_type || "Long"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{formatCompactNumber(v.views || 0)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{formatCompactNumber(v.views_per_day || 0)}</td>
                  <td className="px-4 py-3 text-slate-500">{v.upload_date?.slice(0, 10) || "Recent"}</td>
                  <td className="px-4 py-3">
                    <a
                      href={v.url || `https://www.youtube.com/watch?v=${v.video_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                    >
                      <span>Watch</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
