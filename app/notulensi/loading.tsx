import { FileText, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";

export default function NotulensiLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mt-2 animate-pulse" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
      </div>

      {/* Search and Filters Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                </div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notulensi List Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Rapat", "Status", "Dibuat Oleh", "Tanggal Dibuat", "Action Items", "Aksi"].map((header) => (
                    <th key={header} className="text-left py-3 px-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <FileText className="w-6 h-6 animate-pulse" />
          <span className="text-lg">Memuat notulensi...</span>
        </div>
      </div>
    </div>
  );
}