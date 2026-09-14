"use client";

import { ReactNode, useState } from "react";
import { Sidebar, type NavItemId } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  activeItem: NavItemId;
  onNavigate: (item: NavItemId) => void;
  children: ReactNode;
};

export function AppShell({ activeItem, onNavigate, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        activeItem={activeItem}
        collapsed={collapsed}
        onNavigate={onNavigate}
        onToggle={() => setCollapsed((value) => !value)}
      />

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 xl:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="h-full w-80 max-w-[86vw] border-r border-border bg-background"
            onClick={(event) => event.stopPropagation()}
          >
            <Sidebar
              activeItem={activeItem}
              collapsed={false}
              mobile
              onNavigate={(item) => {
                onNavigate(item);
                setMobileOpen(false);
              }}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className={cn("transition-[margin] duration-200", collapsed ? "xl:ml-20" : "xl:ml-64")}>
        <Topbar onMobileMenu={() => setMobileOpen(true)} />
        <main>{children}</main>
      </div>
    </div>
  );
}
