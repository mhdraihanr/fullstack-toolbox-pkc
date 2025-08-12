"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Filter,
  Calendar,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

// Add CSS animations
const chartAnimations = `
  @keyframes drawLine {
    to {
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = chartAnimations;
  document.head.appendChild(styleElement);
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface FilterOption {
  label: string;
  value: string;
  period?: number; // for time-based filters
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
  showFilters?: boolean;
  filterOptions?: FilterOption[];
  onFilterChange?: (filter: FilterOption) => void;
  defaultFilter?: string;
  showDataToggle?: boolean;
  animated?: boolean;
}

// Modern Bar Chart Component with animations
function SimpleBarChart({
  data,
  animated = true,
}: {
  data: ChartData[];
  animated?: boolean;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colorPalette = [
    "bg-gradient-to-r from-blue-500 to-blue-600",
    "bg-gradient-to-r from-emerald-500 to-emerald-600",
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-orange-500 to-orange-600",
    "bg-gradient-to-r from-pink-500 to-pink-600",
    "bg-gradient-to-r from-indigo-500 to-indigo-600",
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {data.map((item, index) => {
        const isHovered = hoveredIndex === index;

        // Get color class based on status
        const getColorByStatus = (label: string) => {
          const statusColors: { [key: string]: string } = {
            pending: "bg-amber-500 dark:bg-amber-600",
            "in progress": "bg-blue-500 dark:bg-blue-600",
            completed: "bg-emerald-500 dark:bg-emerald-600",
            cancelled: "bg-red-500 dark:bg-red-600",
          };
          const normalizedLabel = label.toLowerCase();
          return (
            statusColors[normalizedLabel] || "bg-gray-500 dark:bg-gray-600"
          );
        };

        return (
          <div
            key={index}
            className="group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center justify-between py-2">
              <div className="text-xs sm:text-sm font-medium text-foreground truncate flex-1">
                {item.label}
              </div>
              <div
                className={`text-xs sm:text-sm font-bold ml-2 px-2 py-1 rounded-lg text-white transition-all duration-300 shadow-md hover:shadow-lg min-w-[2rem] sm:min-w-[2.5rem] text-center ${getColorByStatus(
                  item.label
                )} ${isHovered ? "scale-105" : ""}`}
              >
                {item.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simple Line Chart Component - Compact and easy to understand
function SimpleLineChart({
  data,
  animated = true,
  filterOptions = [],
  onFilterChange,
  selectedFilter,
}: {
  data: ChartData[];
  animated?: boolean;
  filterOptions?: FilterOption[];
  onFilterChange?: (filter: FilterOption) => void;
  selectedFilter?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const maxValue = Math.max(...data.map((d) => d.value));

  // Get color for each point
  const getPointColor = (label: string) => {
    const statusColors: { [key: string]: string } = {
      pending: "#f59e0b",
      "in progress": "#3b82f6",
      completed: "#10b981",
      cancelled: "#ef4444",
    };
    return statusColors[label.toLowerCase()] || "#6b7280";
  };

  // Responsive chart dimensions
  const width = 400;
  const height = 260;
  const padding = 45;
  const bottomPadding = 80; // Extra space for month labels
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding - bottomPadding;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - (item.value / (maxValue || 1)) * chartHeight;
    return { x, y, ...item, index };
  });

  // Create path for the line
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  // Create area path for gradient fill
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${
    height - bottomPadding
  } L ${padding} ${height - bottomPadding} Z`;

  // Smart label display based on data length and screen size
  const shouldShowLabel = (index: number) => {
    const dataLength = data.length;
    if (dataLength <= 6) return true; // Show all if 6 or fewer items
    if (dataLength <= 12) return index % 2 === 0; // Show every other if 7-12 items
    return index % 3 === 0; // Show every third if more than 12 items
  };

  // Responsive label length
  const getLabelText = (label: string, index: number) => {
    if (!shouldShowLabel(index)) return "";
    const dataLength = data.length;
    if (dataLength > 8) {
      return label.substring(0, 4); // Slightly longer for better readability
    }
    return label.length > 8 ? label.substring(0, 8) : label; // Better length
  };

  // Build month filter options from data labels (fallback if no filterOptions provided)
  const monthOptions = useMemo<FilterOption[]>(() => {
    if (filterOptions && filterOptions.length > 0) return filterOptions;
    const labels = Array.from(new Set(data.map((d) => d.label)));
    return labels.map((l) => ({ label: l, value: l }));
  }, [data, filterOptions]);

  const handleFilterChange = (filter: FilterOption) => {
    setShowDropdown(false);
    onFilterChange?.(filter);
  };

  return (
    <div className="w-full space-y-4">
      {/* Filter Bulan di area chart */}
      {monthOptions && monthOptions.length > 0 && (
        <div className="flex justify-end mb-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-muted/50 transition-all duration-200 shadow-sm"
            >
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {monthOptions.find((f) => f.value === selectedFilter)?.label || "Pilih Bulan"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <>
                <div className="absolute right-0 top-full mt-2 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[180px] overflow-hidden">
                  {monthOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option)}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors ${
                        selectedFilter === option.value
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Line Chart dengan container responsif */}
      <div className="relative w-full bg-gradient-to-br from-background via-background to-muted/10 rounded-xl border border-border/50 p-4 shadow-sm overflow-hidden">
        <svg
          width={width}
          height={height}
          className="w-full h-auto max-w-full mx-auto"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - bottomPadding}
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
            opacity="0.7"
          />
          <line
            x1={padding}
            y1={height - bottomPadding}
            x2={width - padding}
            y2={height - bottomPadding}
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Vertical grid lines aligned with data points */}
          {points.map((point, index) => (
            <line
              key={`vgrid-${index}`}
              x1={point.x}
              y1={padding}
              x2={point.x}
              y2={height - bottomPadding}
              stroke="hsl(var(--muted))"
              strokeWidth="0.5"
              opacity="0.2"
              strokeDasharray="3,3"
            />
          ))}

          {/* Horizontal grid lines (8 steps) */}
          {Array.from({ length: 9 }).map((_, i) => {
            const ratio = i / 8;
            const y = padding + chartHeight - ratio * chartHeight;
            return (
              <line
                key={`hgrid-${i}`}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="hsl(var(--muted))"
                strokeWidth="0.5"
                opacity={i === 0 || i === 8 ? 0.4 : 0.15}
                strokeDasharray={i === 0 || i === 8 ? "none" : "3,3"}
              />
            );
          })}

          {/* Y-axis labels dengan font lebih besar */}
          {[0, 0.5, 1].map((ratio, index) => {
            const y = padding + chartHeight - ratio * chartHeight;
            const value = Math.round(ratio * (maxValue || 0));
            return (
              <text
                key={`ylabel-${index}`}
                x={padding - 15}
                y={y + 5}
                textAnchor="end"
                className="text-sm font-medium fill-foreground"
                fontSize="14"
              >
                {value}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#lineGradient)" className="transition-all duration-500" />

          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3.5"
            className="transition-all duration-500"
            filter="url(#glow)"
            style={{
              strokeDasharray: animated ? "700" : "none",
              strokeDashoffset: animated ? "700" : "0",
              animation: animated ? "drawLine 2s ease-out forwards" : "none",
            }}
          />

          {/* Data points */}
          {points.map((point, index) => {
            const isHovered = hoveredIndex === index;
            const isSelected = selectedFilter ? point.label === selectedFilter : true;
            return (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered || isSelected ? 9 : 7}
                  fill={getPointColor(point.label)}
                  stroke="white"
                  strokeWidth="3"
                  opacity={isSelected ? 1 : 0.4}
                  className="transition-all duration-200 cursor-pointer drop-shadow-lg"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    animation: animated
                      ? `fadeInScale 0.5s ease-out ${index * 100}ms forwards`
                      : "none",
                  }}
                />

                {/* Enhanced Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={point.x - 45}
                      y={point.y - 55}
                      width="90"
                      height="42"
                      rx="10"
                      fill="hsl(var(--popover))"
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      className="drop-shadow-xl"
                    />
                    <text
                      x={point.x}
                      y={point.y - 32}
                      textAnchor="middle"
                      className="text-sm font-semibold fill-foreground"
                    >
                      {point.label}
                    </text>
                    <text
                      x={point.x}
                      y={point.y - 18}
                      textAnchor="middle"
                      className="text-sm fill-muted-foreground"
                    >
                      {point.value} items
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Label bulan dengan font lebih besar */}
          {points.map((point, index) => {
            const labelText = getLabelText(point.label, index);
            if (!labelText) return null;
            const isSelected = selectedFilter ? point.label === selectedFilter : false;
            return (
              <text
                key={`xlabel-${index}`}
                x={point.x}
                y={height - bottomPadding + 32}
                textAnchor="middle"
                className={`transition-all duration-200 ${
                  isSelected
                    ? "fill-foreground font-bold text-base"
                    : "fill-muted-foreground text-base font-medium"
                }`}
                fontSize="16"
              >
                {labelText}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// Modern Pie Chart Component with SVG
function SimplePieChart({
  data,
  animated = true,
}: {
  data: ChartData[];
  animated?: boolean;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colorPalette = [
    "hsl(220, 70%, 50%)", // Blue
    "hsl(142, 70%, 50%)", // Green
    "hsl(48, 70%, 50%)", // Yellow
    "hsl(0, 70%, 50%)", // Red
    "hsl(280, 70%, 50%)", // Purple
    "hsl(24, 70%, 50%)", // Orange
  ];

  // Calculate angles for each segment
  let currentAngle = -90; // Start from top
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      angle,
      color: item.color || colorPalette[index % colorPalette.length],
    };
  });

  const createPath = (
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      centerX,
      centerY,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
      {/* Modern SVG Pie Chart */}
      <div className="relative flex-shrink-0">
        <svg
          width="160"
          height="160"
          className="transform transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {segments.map((segment, index) => (
              <filter key={index} id={`shadow-${index}`}>
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodOpacity="0.3"
                />
              </filter>
            ))}
          </defs>

          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="hsl(var(--muted))"
            className="opacity-20"
          />

          {/* Pie segments */}
          {segments.map((segment, index) => {
            const isHovered = hoveredIndex === index;
            const radius = isHovered ? 75 : 70;
            const path = createPath(
              80,
              80,
              radius,
              segment.startAngle,
              segment.endAngle
            );

            return (
              <path
                key={index}
                d={path}
                fill={segment.color}
                className={`cursor-pointer transition-all duration-300 ${
                  isHovered ? "opacity-90" : "opacity-80 hover:opacity-90"
                }`}
                filter={isHovered ? `url(#shadow-${index})` : undefined}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transformOrigin: "80px 80px",
                  animation: animated
                    ? `fadeInScale 0.6s ease-out ${index * 100}ms both`
                    : "none",
                }}
              />
            );
          })}

          {/* Center circle for donut effect */}
          <circle
            cx="80"
            cy="80"
            r="25"
            fill="hsl(var(--background))"
            className="drop-shadow-sm"
          />

          {/* Center text */}
          <text
            x="80"
            y="75"
            textAnchor="middle"
            className="text-sm font-bold fill-foreground"
            fontSize="14"
          >
            Total
          </text>
          <text
            x="80"
            y="90"
            textAnchor="middle"
            className="text-base font-bold fill-primary"
            fontSize="16"
          >
            {total}
          </text>
        </svg>

        {/* Hover tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-4 py-3 rounded-lg shadow-xl border text-sm font-medium z-10">
            <div className="text-center">
              <div className="font-bold text-base">{segments[hoveredIndex].label}</div>
              <div className="text-muted-foreground text-sm">
                {segments[hoveredIndex].value} (
                <span className="font-bold text-base">{segments[hoveredIndex].percentage.toFixed(1)}%</span>)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Legend */}
      <div className="space-y-3 flex-1 min-w-0">
        {segments.map((segment, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                isHovered ? "bg-muted/50 scale-105" : "hover:bg-muted/30"
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <span
                  className={`text-sm truncate transition-colors duration-200 ${
                    isHovered
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {segment.label}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-right">
                <span
                  className={`text-base font-bold transition-colors duration-200 ${
                    isHovered ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {segment.value}
                </span>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full transition-all duration-200 ${
                    isHovered
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {segment.percentage.toFixed(1)}%
                </span>
              </div>
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
  showFilters = false,
  filterOptions = [],
  onFilterChange,
  defaultFilter,
  showDataToggle = false,
  animated = true,
}: ChartCardProps) {
  const [selectedFilter, setSelectedFilter] = useState(
    defaultFilter || filterOptions[0]?.value || ""
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showData, setShowData] = useState(true);

  const handleFilterChange = (filter: FilterOption) => {
    setSelectedFilter(filter.value);
    setShowDropdown(false);
    onFilterChange?.(filter);
  };

  const renderChart = () => {
    if (!showData) return null;

    switch (type) {
      case "line":
        return (
          <SimpleLineChart
            data={data}
            animated={animated}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            selectedFilter={selectedFilter}
          />
        );
      case "pie":
        return <SimplePieChart data={data} animated={animated} />;
      default:
        return <SimpleBarChart data={data} animated={animated} />;
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case "line":
        return (
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
        );
      case "pie":
        return (
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-primary to-primary/60 flex-shrink-0" />
        );
      default:
        return (
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
        );
    }
  };

  return (
    <Card
      className={`${className} overflow-hidden transition-all duration-300 hover:shadow-lg`}
    >
      <CardHeader className="p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getChartIcon()}
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold truncate">
                {title}
              </CardTitle>
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {showDataToggle && (
              <button
                onClick={() => setShowData(!showData)}
                className="p-2 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted/50 transition-colors"
                title={showData ? "Hide chart" : "Show chart"}
              >
                {showData ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}

            {showFilters && filterOptions.length > 0 && type !== "line" && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-background/80 backdrop-blur-sm border border-border/50 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Filter className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    {filterOptions.find((f) => f.value === selectedFilter)
                      ?.label || "Filter"}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-20 min-w-[120px]">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange(option)}
                        className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md ${
                          selectedFilter === option.value
                            ? "bg-muted text-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {trend && (
          <div className="flex items-center space-x-2 mt-3">
            <Badge
              variant={trend.isPositive ? "default" : "destructive"}
              className="flex items-center space-x-1 text-xs"
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </Badge>
            <span className="text-xs sm:text-sm text-muted-foreground">
              vs {trend.period}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 lg:p-6">
        {data.length > 0 ? (
          <div className="transition-all duration-300">{renderChart()}</div>
        ) : (
          <div className="flex items-center justify-center h-32 sm:h-40 text-muted-foreground">
            <div className="text-center">
              {getChartIcon()}
              <p className="text-xs sm:text-sm mt-2 opacity-60">
                Tidak ada data untuk ditampilkan
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Click outside handler */}
      {showDropdown && type !== "line" && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </Card>
  );
}
