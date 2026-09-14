"use client";

import { createContext, ReactNode, useContext } from "react";
import { useChannelAnalysis } from "@/hooks/useChannelAnalysis";

type ChannelAnalysisState = ReturnType<typeof useChannelAnalysis>;

const ChannelAnalysisContext = createContext<ChannelAnalysisState | null>(null);

export function ChannelAnalysisProvider({ children }: { children: ReactNode }) {
  const state = useChannelAnalysis();
  return (
    <ChannelAnalysisContext.Provider value={state}>
      {children}
    </ChannelAnalysisContext.Provider>
  );
}

export function useChannelAnalysisContext() {
  const context = useContext(ChannelAnalysisContext);
  if (!context) {
    throw new Error("useChannelAnalysisContext must be used inside ChannelAnalysisProvider");
  }
  return context;
}

