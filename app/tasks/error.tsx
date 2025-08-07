"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
      <AlertTriangle className="h-16 w-16 text-red-500" />
      <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
      <p className="text-muted-foreground max-w-md">
        Maaf, terjadi kesalahan saat memuat halaman tasks. Silakan coba lagi
        atau hubungi administrator jika masalah berlanjut.
      </p>
      <div className="flex space-x-4">
        <Button onClick={() => reset()}>Coba Lagi</Button>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Kembali ke Dashboard
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-muted rounded-md text-left overflow-auto max-w-2xl">
          <p className="font-mono text-sm">{error.message}</p>
          {error.stack && (
            <pre className="mt-2 text-xs text-muted-foreground">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}