import React from "react";

export default function TasksLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-10 w-48 bg-muted rounded-md animate-pulse mb-2"></div>
          <div className="h-6 w-72 bg-muted rounded-md animate-pulse"></div>
        </div>
        <div className="h-10 w-36 bg-muted rounded-md animate-pulse"></div>
      </div>

      {/* Filters and Search Skeleton */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
          <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
          <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
          <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* View Toggle Skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
          <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
        </div>
        <div className="h-6 w-24 bg-muted rounded-md animate-pulse"></div>
      </div>

      {/* Board View Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded-md animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded-md animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded-md animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}