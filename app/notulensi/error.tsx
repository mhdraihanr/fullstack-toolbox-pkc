"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

export default function NotulensiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Notulensi page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Terjadi Kesalahan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Maaf, terjadi kesalahan saat memuat halaman notulensi. Silakan coba lagi atau kembali ke halaman utama.
            </p>
            
            {process.env.NODE_ENV === "development" && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 dark:text-red-400 font-mono">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ke Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <Link 
              href="/notulensi" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Kembali ke Daftar Notulensi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}