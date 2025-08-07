export default function MeetingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-12 gap-4 p-4 border-b">
          <div className="h-4 bg-gray-200 rounded animate-pulse col-span-1" />
          <div className="h-4 bg-gray-200 rounded animate-pulse col-span-4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse col-span-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse col-span-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse col-span-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse col-span-1" />
        </div>

        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 p-4 border-b">
            <div className="h-6 bg-gray-200 rounded animate-pulse col-span-1" />
            <div className="col-span-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
            <div className="col-span-2 space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-3 bg-gray-200 rounded animate-pulse col-span-2" />
            <div className="h-8 bg-gray-200 rounded-full animate-pulse col-span-2" />
            <div className="h-5 bg-gray-200 rounded animate-pulse col-span-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
