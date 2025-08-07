"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, X, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
      default:
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 min-w-[300px]",
        getBackgroundColor(),
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      {getIcon()}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
        {message}
      </p>
      <button
        aria-label="Close toast"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast Provider Hook
export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      message: string;
      type: "success" | "error" | "info";
      duration?: number;
    }>
  >([]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
    duration = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return {
    showToast,
    ToastContainer,
  };
}
