"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Halaman Tidak Ditemukan
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
              404
            </div>
          </div>
          
          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Kembali ke Dashboard
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Halaman Sebelumnya
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <p>Atau coba navigasi menggunakan menu di atas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}