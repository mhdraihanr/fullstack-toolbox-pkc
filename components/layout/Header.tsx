"use client";

import React from "react";
import { Search, Bell, Settings, Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserProfile } from "@/components/auth/UserProfile";
import { useAuth } from "@/components/providers/AuthProvider";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 dark:border-border/20 bg-background/95 dark:bg-[#1E1E2D]/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm dark:shadow-lg dark:shadow-black/10">
      <div className="w-full flex h-14 items-center px-2 sm:px-4 lg:px-6 max-w-none">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-1 sm:mr-2 md:hidden flex-shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Logo */}
        <div 
          className="mr-2 sm:mr-4 flex items-center space-x-1 sm:space-x-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <Image
            src="/logo.png"
            alt="Web Toolbox Logo"
            width={40}
            height={40}
            className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full shadow-md object-cover"
          />
          <div className=" xs:block">
            <div className="flex items-center">
              <span className="font-bold text-xs sm:text-sm lg:text-base text-green-800 dark:text-green-500">
                TOOLBOX
              </span>
              <span className="font-bold text-xs sm:text-sm lg:text-base ml-1">
                PKC
              </span>
            </div>
            <div className="text-[7px] sm:text-[9px] lg:text-xs text-muted-foreground font-medium -mt-0.5">
              Productivity & Collaboration
            </div>
          </div>
        </div>

        {/* Search - Flexible center area */}
        <div className="flex-1 flex items-center justify-center min-w-0 mx-1 sm:mx-2 lg:mx-4">
          <div className="relative w-full max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground" />
            <input
              placeholder="Cari..."
              className="w-full rounded-md border border-input bg-background pl-6 sm:pl-8 lg:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Right side actions - Always positioned at the right */}
        <div className="flex items-center space-x-0.5 sm:space-x-1 lg:space-x-2 flex-shrink-0 ml-auto">
          {/* Notifications */}
          <NotificationDropdown />
          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
          {/* Settings - Hidden on very small screens
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 flex-shrink-0"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          </Button> */}

          {/* User menu */}
          <div className="ml-0.5 sm:ml-1 lg:ml-2 flex-shrink-0">
            <UserProfile variant="compact" showDropdown={true} />
          </div>
        </div>
      </div>
    </header>
  );
}
