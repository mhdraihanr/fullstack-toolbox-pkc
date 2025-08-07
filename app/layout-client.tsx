"use client";

import { useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import { Header, Sidebar } from "@/components/layout";
import { cn } from "@/lib/utils";

interface LayoutClientProps {
  children: React.ReactNode;
}

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

function LayoutContent({ children }: LayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Check if current page is an auth page
  const isAuthPage = pathname?.startsWith("/auth");

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For auth pages, render without header and sidebar
  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // For authenticated pages, render with header and sidebar
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex flex-1">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-40 bg-background dark:bg-[#1E1E2D] border-r transition-all duration-300 ease-in-out md:fixed md:inset-y-0 md:left-0 md:translate-x-0 flex-shrink-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
              isCollapsed ? "w-12 sm:w-16" : "w-48 sm:w-52 lg:w-56 xl:w-60"
            )}
          >
            <div className="pt-14 md:pt-16 h-screen overflow-hidden">
              <Sidebar />
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main
            className={cn(
              "flex-1 min-w-0 overflow-auto dark:bg-blue-800/20 transition-all duration-300",
              isCollapsed
                ? "md:ml-12 lg:ml-16"
                : "md:ml-48 lg:ml-52 xl:ml-56 2xl:ml-60"
            )}
          >
            <div className="w-full max-w-none p-3 sm:p-4 lg:p-6 xl:p-8">
              <div className="w-full max-w-7xl mx-auto">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

export function LayoutClient({ children }: LayoutClientProps) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
