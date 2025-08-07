import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm md:text-base font-medium">
          {title}
        </CardTitle>
        {icon && <div className="h-5 w-5 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground mt-1">
            {trend && (
              <span
                className={cn(
                  "flex items-center font-medium",
                  trend.isPositive ? "text-primary" : "text-red-600"
                )}
              >
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
