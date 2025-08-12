"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  BarChart3,
  QrCode,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Menu,
  PanelRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useSidebar } from "@/app/layout-client";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    children: [
      { title: "All Tasks", href: "/tasks", icon: CheckSquare },
      { title: "Create Task", href: "/tasks/create", icon: Plus },
    ],
  },
  {
    title: "Meetings",
    href: "/meetings",
    icon: Calendar,
    children: [
      { title: "All Meetings", href: "/meetings", icon: Calendar },
      { title: "Create Meeting", href: "/meetings/create", icon: Plus },
    ],
  },
  {
    title: "Notulensi",
    href: "/notulensi",
    icon: FileText,
    children: [
      { title: "All Notulensi", href: "/notulensi", icon: FileText },
      { title: "Draft Notulensi", href: "/notulensi/draft", icon: FileText },
      { title: "Create Notulensi", href: "/notulensi/create", icon: Plus },
    ],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: QrCode,
    children: [
      { title: "Scan QR", href: "/attendance/scan", icon: QrCode },
      { title: "Attendance History", href: "/attendance/history", icon: Users },
    ],
  },
];

function NavItemComponent({
  item,
  level = 0,
  isCollapsed = false,
}: {
  item: NavItem;
  level?: number;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { setIsCollapsed } = useSidebar();
  const hasChildren = item.children && item.children.length > 0;
  const isActive =
    pathname === item.href ||
    (hasChildren && item.children?.some((child) => pathname === child.href));

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  if (isCollapsed) {
    return (
      <div className="relative group">
        <Link
          href={hasChildren ? "#" : item.href}
          onClick={handleClick}
          className={cn(
            "flex items-center justify-center rounded-lg p-1 sm:p-1.5 lg:p-2 text-xs sm:text-sm hover:bg-accent hover:text-accent-foreground",
            {
              "bg-primary/10 text-primary font-medium border-l-2 sm:border-l-3 lg:border-l-4 border-primary":
                isActive && !hasChildren,
              "text-muted-foreground": !isActive,
            }
          )}
          title={item.title}
        >
          <item.icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </Link>

        {/* Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
          <div className="bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs whitespace-nowrap shadow-md border">
            {item.title}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={hasChildren ? "#" : item.href}
        onClick={hasChildren ? handleClick : undefined}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 lg:gap-3 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm hover:bg-accent hover:text-accent-foreground",
          {
            "bg-primary/10 text-primary font-medium border-l-2 sm:border-l-3 lg:border-l-4 border-primary":
              isActive && !hasChildren,
            "text-muted-foreground": !isActive,
            "font-medium": level === 0,
          }
        )}
        style={{ paddingLeft: `${6 + level * 8}px` }}
      >
        <item.icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
        <span className="flex-1 truncate text-xs sm:text-sm">{item.title}</span>
        {hasChildren && (
          <div className="ml-auto flex-shrink-0">
            {isOpen ? (
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            ) : (
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            )}
          </div>
        )}
      </Link>

      {hasChildren && isOpen && (
        <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
          {item.children?.map((child, index) => (
            <NavItemComponent
              key={index}
              item={child}
              level={level + 1}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        "pb-4 sm:pb-6 lg:pb-12 transition-all duration-300 relative h-full flex flex-col overflow-hidden",
        isCollapsed ? "w-12 sm:w-16" : "w-48 sm:w-52 lg:w-56 xl:w-60",
        className
      )}
    >
      {/* Toggle Button */}
      <div
        className={cn(
          "absolute z-10 transition-all duration-300",
          isCollapsed
            ? "top-2 right-1 sm:top-4 sm:right-2"
            : "top-2 right-2 sm:top-5 sm:right-4"
        )}
      >
        <Button
          size="sm"
          onClick={toggleSidebar}
          className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full bg-background border shadow-md hover:bg-accent hover:shadow-lg transition-all flex-shrink-0"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-3 sm:h-4 sm:w-4 dark:text-white text-black cursor-pointer" />
          ) : (
            <PanelRight className="h-4 w-3 sm:h-4 sm:w-4 dark:text-white text-black cursor-pointer" />
          )}
        </Button>
      </div>

      <div className="flex-1 flex flex-col py-2 sm:py-3 lg:py-4 overflow-hidden">
        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 flex-shrink-0">
            <h2 className="mb-2 sm:mb-3 px-1 sm:px-2 text-xs sm:text-sm lg:text-base font-semibold tracking-tight truncate">
              Quick Actions
            </h2>
            <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
              <Link href="/tasks/create">
                <Button
                  variant="default"
                  className="w-full justify-start bg-primary hover:bg-primary/90 h-7 sm:h-8 lg:h-9 text-xs sm:text-sm px-2 sm:px-3 cursor-pointer"
                >
                  <Plus className="mr-1.5 sm:mr-2 lg:mr-3 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="truncate text-xs sm:text-sm">
                    Create Task
                  </span>
                </Button>
              </Link>

              <Link href="/meetings/create">
                <Button
                  variant="outline"
                  className="w-full justify-start border-primary/50 text-primary hover:bg-primary/10 hover:text-primary h-7 sm:h-8 lg:h-9 text-xs sm:text-sm px-2 sm:px-3 cursor-pointer"
                >
                  <Plus className="mr-1.5 sm:mr-2 lg:mr-3 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="truncate text-xs sm:text-sm">
                    Create Meeting
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions - Collapsed */}
        {isCollapsed && (
          <div className="px-1 sm:px-2 pt-8 sm:pt-10 lg:pt-12 flex-shrink-0">
            <div className="space-y-2 sm:space-y-3">
              <div className="relative group">
                <Link href="/tasks/create">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full p-1.5 sm:p-2 bg-primary hover:bg-primary/90 h-7 sm:h-8"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
                  <div className="bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs whitespace-nowrap shadow-md border">
                    Create Task
                  </div>
                </div>
              </div>

              <div className="relative group">
                <Link href="/meetings/create">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full p-1.5 sm:p-2 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary h-7 sm:h-8"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
                  <div className="bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs whitespace-nowrap shadow-md border">
                    Create Meeting
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div
          className={cn(
            "py-2 sm:py-3 flex-1 overflow-y-auto min-h-0",
            isCollapsed ? "px-1 sm:px-2" : "px-2 sm:px-3 lg:px-4"
          )}
        >
          {!isCollapsed && (
            <h2 className="mb-2 sm:mb-3 px-1 sm:px-2 text-xs sm:text-sm lg:text-base font-semibold tracking-tight truncate">
              Navigation
            </h2>
          )}
          <div className="space-y-0.5 sm:space-y-1">
            {navigation.map((item, index) => (
              <NavItemComponent
                key={index}
                item={item}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </div>

        {/* Settings */}
        <div
          className={cn(
            "py-2 sm:py-3 border-t border-border/50 flex-shrink-0",
            isCollapsed ? "px-1 sm:px-2" : "px-2 sm:px-3 lg:px-4"
          )}
        >
          <div className="space-y-0.5 sm:space-y-1">
            {isCollapsed ? (
              <div className="relative group">
                <Link
                  href="/settings"
                  className="flex items-center justify-center rounded-lg p-1 sm:p-1.5 lg:p-2 text-xs sm:text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  title="Settings"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                </Link>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
                  <div className="bg-popover text-popover-foreground dark:text-white px-2 py-1 rounded-md text-xs whitespace-nowrap shadow-md border">
                    Settings
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/settings"
                className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm text-white hover:bg-gray-800 hover:text-white"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0 text-black dark:text-white" />
                <span className="truncate text-xs sm:text-sm text-black dark:text-white">
                  Settings
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
