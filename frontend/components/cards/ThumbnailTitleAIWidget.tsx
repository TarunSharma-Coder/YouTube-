"use client";

import type { Video } from "@/types";

interface ThumbnailTitleAIWidgetProps {
  topVideo?: Video;
  allVideos?: Video[];
}

export function ThumbnailTitleAIWidget({ topVideo, allVideos }: ThumbnailTitleAIWidgetProps) {
  const displayTitle = topVideo?.title || "How to Create a High CTR Thumbnail in 2026";
  const thumbnailImg = topVideo?.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500";

  // Derive top title suggestions dynamically from analyzed video keywords
  const titleSuggestions = (allVideos && allVideos.length > 1)
    ? [
        `How to Master ${allVideos[0]?.keywords?.split(",")[0] || "YouTube CTR"} in 2026`,
        `Top 10 Complete Audience Strategies for ${allVideos[1]?.channel || "Your Channel"}`,
        `How to Rank ${allVideos[2]?.keywords?.split(",")[0] || "AI Content"} on Recommendations`,
      ]
    : [
        "How to Create a High CTR Thumbnail in 2026",
        "Top 10 Complete Audience Growth Strategies for YouTube",
        "How to Engage The Least Interested Viewers - Strategy",
      ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-base font-bold text-slate-800">Thumbnail & Title AI</h3>
        <span className="text-xs font-semibold text-blue-600">Live AI Vision Audit</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left Bounding Box Image Preview */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video group shadow-md">
          {/* Thumbnail background image */}
          <img
            src={thumbnailImg}
            alt="Thumbnail"
            className="absolute inset-0 size-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* AI Bounding Box 1: Face Engaged */}
          <div className="absolute top-2 left-2 border border-red-500 rounded-md px-1.5 py-0.5 bg-red-950/80 backdrop-blur-xs">
            <span className="text-[9px] font-bold text-red-300 block">Face: Engaged</span>
          </div>

          {/* AI Bounding Box 2: Title overlay */}
          <div className="absolute bottom-6 right-2 border border-blue-400 rounded-md px-1.5 py-0.5 bg-blue-950/80 backdrop-blur-xs max-w-[80%] truncate">
            <span className="text-[9px] font-bold text-blue-300 truncate block">{displayTitle}</span>
          </div>

          {/* Text Clarity Pill */}
          <div className="absolute bottom-2 left-2 rounded-md bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 shadow-xs">
            Text Clarity: 98%
          </div>
        </div>

        {/* Right Title Recommendations List */}
        <div className="space-y-2.5">
          {titleSuggestions.map((title, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-2.5 transition-all cursor-pointer ${
                idx === 0
                  ? "border-blue-200 bg-blue-50/70 hover:bg-blue-100/60"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
