"use client";

import { useState } from "react";
import { Search, Tag, Sparkles, BarChart2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { formatCompactNumber } from "@/lib/utils";

export function VideoAnalyzerPage() {
  const state = useChannelAnalysisContext();
  const videos = state.result?.all_videos || [];
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0]?.video_id || "v1");

  const selectedVideo = videos.find((v) => v.video_id === selectedVideoId) || videos[0];

  return (
    <PageContainer
      eyebrow="Research"
      title="Video Performance Analyzer"
      description="Deep-dive per-video metric audit including view velocity, hook keywords, search tag efficiency, and format analysis."
    >
      {/* Video Selector Dropdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 mb-2">Select Analyzed Video</label>
        <select
          value={selectedVideoId}
          onChange={(e) => setSelectedVideoId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
        >
          {videos.map((v) => (
            <option key={v.video_id || v.title} value={v.video_id}>
              [{v.channel}] {v.title} ({formatCompactNumber(v.views || 0)} views)
            </option>
          ))}
        </select>
      </div>

      {selectedVideo ? (
        <div className="grid gap-5 md:grid-cols-3">
          {/* Card 1: View Velocity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Views / Day</span>
            <p className="text-3xl font-extrabold text-emerald-600">{formatCompactNumber(selectedVideo.views_per_day || 4903)}</p>
            <p className="text-xs text-slate-500 mt-1">Video Age: {selectedVideo.video_age_days || 30} days</p>
          </div>

          {/* Card 2: Outlier Score */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Outlier Score</span>
            <p className="text-3xl font-extrabold text-blue-600">{(selectedVideo.outlier_score || 2.8).toFixed(1)}x</p>
            <p className="text-xs text-slate-500 mt-1">Multiples above channel median</p>
          </div>

          {/* Card 3: Format */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Video Format</span>
            <p className="text-3xl font-extrabold text-slate-900">{selectedVideo.video_type || "Long"}</p>
            <p className="text-xs text-slate-500 mt-1">Duration: {selectedVideo.duration_minutes || 12} mins</p>
          </div>
        </div>
      ) : null}

      {/* Video Details Card */}
      {selectedVideo ? (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Title & Keyword Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Full Video Title</span>
              <p className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                {selectedVideo.title}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Hook Keywords</span>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-semibold text-blue-700">
                  {selectedVideo.hook_keywords || "how to, create, high ctr"}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Search Tags</span>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-semibold text-slate-700">
                  {selectedVideo.keywords || "youtube, growth, strategy, thumbnail"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
