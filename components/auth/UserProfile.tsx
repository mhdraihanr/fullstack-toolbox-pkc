"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { User, Settings, ChevronDown } from "lucide-react";
import { LogoutMenuItem } from "./LogoutButton";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface UserProfileProps {
  variant?: "full" | "compact" | "avatar-only";
  showDropdown?: boolean;
}

export function UserProfile({
  variant = "full",
  showDropdown = true,
}: UserProfileProps) {
  const { user, profile, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        </div>
        {variant === "full" && (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Use profile data first, fallback to user metadata
  const userName =
    profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const userDepartment = profile?.department || user.user_metadata?.department || "Unknown Department";
  const userRole = profile?.role || user.user_metadata?.role || "employee";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  const Avatar = () => (
    <div className="relative">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={userName}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
    </div>
  );

  const UserInfo = () => (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
        {userName}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {userDepartment}
      </p>
    </div>
  );

  const DropdownMenu = () => (
    <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[60] border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {userName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {user.email}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
          {userRole} • {userDepartment}
        </p>
      </div>

      <Link href="/settings" className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Settings className="mr-3 h-4 w-4 flex-shrink-0" />
        <span className="truncate">Pengaturan</span>
      </Link>

      <div className="border-t border-gray-100 dark:border-gray-700">
        <LogoutMenuItem />
      </div>
    </div>
  );

  if (variant === "avatar-only") {
    return showDropdown ? (
      <div className="relative" ref={dropdownRef}>
        <button
          title="Open user profile"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Avatar />
        </button>
        {isDropdownOpen && <DropdownMenu />}
      </div>
    ) : (
      <Avatar />
    );
  }

  if (variant === "compact") {
    return showDropdown ? (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-1 sm:space-x-2 rounded-lg px-1 sm:px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Avatar />
          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-16 sm:max-w-24">
            {userName}
          </span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        </button>
        {isDropdownOpen && <DropdownMenu />}
      </div>
    ) : (
      <div className="flex items-center space-x-1 sm:space-x-2">
        <Avatar />
        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-16 sm:max-w-24">
          {userName}
        </span>
      </div>
    );
  }

  // Full variant
  return showDropdown ? (
    <div className="relative" ref={dropdownRef}>
      <button
        title="Open user profile"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 w-full rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Avatar />
        <UserInfo />
        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      </button>
      {isDropdownOpen && <DropdownMenu />}
    </div>
  ) : (
    <div className="flex items-center space-x-3">
      <Avatar />
      <UserInfo />
    </div>
  );
}

// Simple user badge component
export function UserBadge() {
  const { user, profile } = useAuth();

  if (!user) return null;

  const userName =
    profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const userRole = profile?.role || user.user_metadata?.role || "employee";

  return (
    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      <User className="w-3 h-3 mr-1" />
      {userName} • {userRole}
    </div>
  );
}
