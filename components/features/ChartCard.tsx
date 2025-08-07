"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartCardProps {
  title: string;
  description?: string;
  data: ChartData[];
  type?: "bar" | "line" | "pie";
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  className?: string;
}

// Simple Bar Chart Component
function SimpleBarChart({ data }: { data: ChartData[] }) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-2 sm:space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-16 sm:w-20 text-xs sm:text-sm text-muted-foreground truncate">
            {item.label}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="flex-1 bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.color || "bg-primary"
                  }`}
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                  }}
                />
              </div>
              <div className="text-xs sm:text-sm font-medium w-8 sm:w-12 text-right">
                {item.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple Line Chart Component (using CSS)
function SimpleLineChart({ data }: { data: ChartData[] }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="relative">
      <div className="flex items-end justify-between h-24 sm:h-32 border-b border-l border-muted">
        {data.map((item, index) => {
          const height = ((item.value - minValue) / range) * 100;
          return (
            <div
              key={index}
              className="flex flex-col items-center space-y-1 sm:space-y-2 flex-1"
            >
              <div className="relative flex-1 flex items-end">
                <div
                  className={`w-4 sm:w-6 lg:w-8 rounded-t transition-all duration-500 ${
                    item.color || "bg-primary"
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-center truncate max-w-full">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1 sm:mt-2">
        <span>{minValue}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}

// Simple Pie Chart Component (using CSS)
function SimplePieChart({ data }: { data: ChartData[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
      {/* Pie Chart */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex-shrink-0">
        <div className="w-full h-full rounded-full bg-muted overflow-hidden">
          {/* This is a simplified representation - in a real app you'd use a proper chart library */}
          <div className="w-full h-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-full" />
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center space-x-2">
              <div
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                  item.color ||
                  [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-yellow-500",
                    "bg-red-500",
                  ][index % 4]
                }`}
              />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {item.label}: {item.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartCard({
  title,
  description,
  data,
  type = "bar",
  trend,
  className,
}: ChartCardProps) {
  const renderChart = () => {
    switch (type) {
      case "line":
        return <SimpleLineChart data={data} />;
      case "pie":
        return <SimplePieChart data={data} />;
      default:
        return <SimpleBarChart data={data} />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold truncate">{title}</CardTitle>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
        </div>

        {trend && (
          <div className="flex items-center space-x-1 sm:space-x-2 mt-2">
            <Badge
              variant={trend.isPositive ? "success" : "destructive"}
              className="flex items-center space-x-1 text-xs"
            >
              {trend.isPositive ? (
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </Badge>
            <span className="text-xs sm:text-sm text-muted-foreground">
              vs {trend.period}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 sm:p-4 lg:p-6">
        {data.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-24 sm:h-32 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">Tidak ada data untuk ditampilkan</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
