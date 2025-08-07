"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  size = "md",
  showIcon = true,
  showText = true,
  className = "",
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    default: "bg-red-600 text-white hover:bg-red-700",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8",
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        showIcon && <LogOut className={`${showText ? "mr-2" : ""} h-4 w-4`} />
      )}
      {showText && (loading ? "Keluar..." : "Keluar")}
    </button>
  );
}

// Dropdown menu item version
export function LogoutMenuItem() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:text-white dark:hover:bg-gray-700"
    >
      {loading ? (
        <svg
          className="animate-spin mr-3 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <LogOut className="mr-3 h-4 w-4" />
      )}
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}
