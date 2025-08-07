"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function MeetingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-900">
          Terjadi Kesalahan
        </h2>
        <p className="text-gray-600 max-w-md">
          Maaf, terjadi kesalahan saat memuat data meeting. Silakan coba lagi.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500">Error ID: {error.digest}</p>
        )}
        <Button onClick={reset} className="inline-flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
