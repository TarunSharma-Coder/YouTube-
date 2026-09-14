"use client";

import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Flame,
  History,
  ImageIcon,
  LayoutDashboard,
  Lightbulb,
  MessageSquareText,
  PieChart,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Trophy,
  Type,
  User,
  Users,
  Video,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItemId =
  | "dashboard"
  | "your-channel"
  | "competitors"
  | "video-analyzer"
  | "outliers"
  | "trends"
  | "seasonal"
  | "search-demand"
  | "comments"
  | "content-gap"
  | "thumbnail"
  | "title"
  | "content-ideas"
  | "historical"
  | "alerts"
  | "settings";

type SidebarProps = {
  activeItem: NavItemId;
  collapsed: boolean;
  mobile?: boolean;
  onNavigate: (item: NavItemId) => void;
  onToggle: () => void;
};

const navGroups = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
      { id: "your-channel", label: "Your Channel", icon: User },
    ],
  },
  {
    label: "Research",
    items: [
      { id: "competitors", label: "Research - Competitors", icon: Users },
      { id: "video-analyzer", label: "Research - Video Analyzer", icon: Video },
      { id: "outliers", label: "Research - Outliers", icon: Trophy },
      { id: "trends", label: "Research - Trends", icon: TrendingUp },
      { id: "seasonal", label: "Research - Seasonal", icon: Flame },
      { id: "search-demand", label: "Research - Search Demand", icon: Search },
      { id: "comments", label: "Research - Audience Intel", icon: MessageSquareText },
      { id: "content-gap", label: "Research - Content Gap", icon: Sparkles },
    ],
  },
  {
    label: "Create",
    items: [
      { id: "thumbnail", label: "Create - Thumbnail AI", icon: ImageIcon },
      { id: "title", label: "Create - Title AI", icon: Type },
      { id: "content-ideas", label: "Create - Content Ideas", icon: Lightbulb },
    ],
  },
  {
    label: "Track & Settings",
    items: [
      { id: "historical", label: "Track - Historical Data", icon: History },
      { id: "alerts", label: "Track - Alerts", icon: Bell },
      { id: "settings", label: "Settings - Settings", icon: Settings },
    ],
  },
] as const;

export function Sidebar({ activeItem, collapsed, mobile = false, onNavigate, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "inset-y-0 left-0 z-40 border-r border-border bg-surface",
        mobile ? "relative block h-full w-full" : "fixed hidden xl:block",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-xs">
              <Youtube className="size-5 fill-white" />
            </div>
            {!collapsed ? (
              <span className="truncate text-base font-bold tracking-tight text-foreground">
                YouTube Studio AI
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* Main Categorized Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed ? (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeItem === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onNavigate(item.id as NavItemId)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                      active
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      collapsed && "justify-center",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active ? "text-blue-600" : "text-slate-500")} />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
