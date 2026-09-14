"use client";

import { ThumbnailAnalyzerUI } from "@/components/analyzers/ThumbnailAnalyzerUI";
import { TitleAnalyzerUI } from "@/components/analyzers/TitleAnalyzerUI";
import { AppShell } from "@/components/layout/AppShell";
import { type NavItemId } from "@/components/layout/Sidebar";
import { AlertsPage } from "@/components/pages/AlertsPage";
import { CommentIntelligencePage } from "@/components/pages/CommentIntelligencePage";
import { CompetitorsPage } from "@/components/pages/CompetitorsPage";
import { ContentIdeasPage } from "@/components/pages/ContentIdeasPage";
import { HistoricalPage } from "@/components/pages/HistoricalPage";
import { OverviewPage } from "@/components/pages/OverviewPage";
import { OutliersPage } from "@/components/pages/OutliersPage";
import { SearchDemandPage } from "@/components/pages/SearchDemandPage";
import { SeasonalPage } from "@/components/pages/SeasonalPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { TrendsPage } from "@/components/pages/TrendsPage";
import { YourChannelPage } from "@/components/pages/YourChannelPage";
import { VideoAnalyzerPage } from "@/components/pages/VideoAnalyzerPage";
import { ContentGapPage } from "@/components/pages/ContentGapPage";
import { ChannelAnalysisProvider } from "@/contexts/ChannelAnalysisContext";
import { useState } from "react";

function renderPage(activeItem: NavItemId) {
  switch (activeItem) {
    case "dashboard":
      return <OverviewPage />;
    case "your-channel":
      return <YourChannelPage />;
    case "competitors":
      return <CompetitorsPage />;
    case "video-analyzer":
      return <VideoAnalyzerPage />;
    case "outliers":
      return <OutliersPage />;
    case "trends":
      return <TrendsPage />;
    case "seasonal":
      return <SeasonalPage />;
    case "search-demand":
      return <SearchDemandPage />;
    case "comments":
      return <CommentIntelligencePage />;
    case "content-gap":
      return <ContentGapPage />;
    case "thumbnail":
      return <ThumbnailAnalyzerUI />;
    case "title":
      return <TitleAnalyzerUI />;
    case "content-ideas":
      return <ContentIdeasPage />;
    case "historical":
      return <HistoricalPage />;
    case "alerts":
      return <AlertsPage />;
    case "settings":
      return <SettingsPage />;
    default:
      return <OverviewPage />;
  }
}

export default function Home() {
  const [activeItem, setActiveItem] = useState<NavItemId>("dashboard");

  return (
    <ChannelAnalysisProvider>
      <AppShell activeItem={activeItem} onNavigate={setActiveItem}>
        {renderPage(activeItem)}
      </AppShell>
    </ChannelAnalysisProvider>
  );
}
