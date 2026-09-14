"use client";

import { ChevronDown, Menu, Search, Sparkles, Youtube } from "lucide-react";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";

type TopbarProps = {
  onMobileMenu: () => void;
  onOpenAnalysisModal?: () => void;
};

export function Topbar({ onMobileMenu, onOpenAnalysisModal }: TopbarProps) {
  const state = useChannelAnalysisContext();
  const channelTitle = state.result?.own_channel?.title || "@TechExplorer";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white shadow-xs">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 xl:hidden hover:bg-slate-100"
            onClick={onMobileMenu}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Channel Selector Dropdown */}
          <button
            type="button"
            onClick={onOpenAnalysisModal}
            className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <div className="flex size-5 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Youtube className="size-3.5" />
            </div>
            <span>{channelTitle}</span>
            <ChevronDown className="size-4 text-slate-400" />
          </button>

          {/* API Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>API Connected</span>
          </div>

          {/* Run AI Audit Action Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenAnalysisModal) {
                onOpenAnalysisModal();
              } else {
                const el = document.getElementById("analysis-form-card");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-red-700 transition-all active:scale-[0.98]"
          >
            <Sparkles className="size-4" />
            <span>Run AI Audit</span>
          </button>
        </div>
      </div>
    </header>
  );
}

