import React from "react";

export default function CreateTaskLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div>
        <div className="h-10 w-48 bg-muted rounded-md animate-pulse mb-2"></div>
        <div className="h-6 w-72 bg-muted rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Skeleton */}
        <div className="md:col-span-2">
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="h-6 w-32 bg-muted rounded-md animate-pulse"></div>
            </div>
            <div className="p-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-32 w-full bg-muted rounded-md animate-pulse"></div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
                  <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2">
                <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Skeleton */}
        <div>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="h-6 w-24 bg-muted rounded-md animate-pulse"></div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="h-6 w-48 bg-muted rounded-md animate-pulse mb-2"></div>
                <div className="h-16 w-full bg-muted rounded-md animate-pulse"></div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="h-5 w-20 bg-muted rounded-md animate-pulse"></div>
                <div className="h-5 w-32 bg-muted rounded-md animate-pulse"></div>
                <div className="h-5 w-24 bg-muted rounded-md animate-pulse"></div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 bg-muted rounded-md animate-pulse"></div>
                <div className="h-6 w-16 bg-muted rounded-md animate-pulse"></div>
                <div className="h-6 w-16 bg-muted rounded-md animate-pulse"></div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <div className="h-6 w-20 bg-muted rounded-md animate-pulse"></div>
                <div className="h-6 w-24 bg-muted rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}