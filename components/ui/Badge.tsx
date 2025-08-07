import React from "react";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle, AlertCircle, XCircle, Play, Pause } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "kujang";
  status?: "pending" | "completed" | "in-progress" | "cancelled" | "draft";
  showIcon?: boolean;
}

function Badge({ className, variant = "default", status, showIcon = true, children, ...props }: BadgeProps) {
  const getStatusIcon = () => {
    if (!showIcon || !status) return null;
    
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3 mr-1" />;
      case "completed":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "in-progress":
        return <Play className="w-3 h-3 mr-1" />;
      case "cancelled":
        return <XCircle className="w-3 h-3 mr-1" />;
      case "draft":
        return <Pause className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 -ml-1",
        {
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80":
            variant === "default",
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80":
            variant === "secondary",
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80":
            variant === "destructive",
          "text-foreground": variant === "outline",
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80":
            variant === "success",
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80":
            variant === "warning",
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80":
            variant === "kujang",
        },
        className
      )}
      {...props}
    >
      {getStatusIcon()}
      {children}
    </div>
  );
}

export { Badge };
