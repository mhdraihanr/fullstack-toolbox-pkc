"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  QrCode,
  Clock,
  Users,
  MapPin,
  RefreshCw,
  ArrowLeft,
  Download,
  Share2,
  Eye,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getActiveQRCodes, QRCodeData } from "../history/data";

export default function QRDisplayPage() {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load QR codes
  const loadQRCodes = () => {
    setIsLoading(true);
    setTimeout(() => {
      const activeQRs = getActiveQRCodes();
      setQrCodes(activeQRs);
      if (activeQRs.length > 0 && !selectedQR) {
        setSelectedQR(activeQRs[0]);
      }
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 500);
  };

  // Refresh QR codes
  const refreshQRCodes = () => {
    loadQRCodes();
  };

  // Navigate back
  const goBack = () => {
    router.push("/attendance/history");
  };

  // Download QR code
  const downloadQR = (qrCode: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qrCode.qrCodeUrl;
    link.download = `qr-${qrCode.meetingTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share QR code
  const shareQR = async (qrCode: QRCodeData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code - ${qrCode.meetingTitle}`,
          text: `QR Code untuk check-in meeting: ${qrCode.meetingTitle}`,
          url: qrCode.qrCodeUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrCode.qrCodeUrl);
      alert('Link QR Code telah disalin ke clipboard');
    }
  };

  // Format time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    }
    return `${minutes}m`;
  };

  useEffect(() => {
    loadQRCodes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            QR Code Kehadiran
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshQRCodes}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">QR Aktif</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {qrCodes.filter(qr => qr.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Scan</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {qrCodes.reduce((sum, qr) => sum + qr.scansCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Meeting Hari Ini</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {qrCodes.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Meeting Aktif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : qrCodes.length === 0 ? (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Tidak ada QR code aktif
                    </p>
                  </div>
                ) : (
                  qrCodes.map((qr) => (
                    <div
                      key={qr.meetingId}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedQR?.meetingId === qr.meetingId
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => setSelectedQR(qr)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {qr.meetingTitle}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={qr.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {qr.isActive ? "Aktif" : "Expired"}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {qr.scansCount} scan
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getTimeRemaining(qr.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* QR Code Display */}
          <div className="lg:col-span-2">
            {selectedQR ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedQR.meetingTitle}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge
                          variant={selectedQR.isActive ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {selectedQR.isActive ? "Aktif" : "Expired"}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Berakhir: {getTimeRemaining(selectedQR.expiresAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQR(selectedQR)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareQR(selectedQR)}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* QR Code */}
                    <div className="flex-shrink-0">
                      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={selectedQR.qrCodeUrl}
                          alt={`QR Code for ${selectedQR.meetingTitle}`}
                          className="w-64 h-64 mx-auto"
                        />
                        <div className="text-center mt-4">
                          <p className="text-sm font-medium text-gray-900">
                            {selectedQR.meetingTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Scan untuk check-in
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Informasi Meeting
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Total Scan
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {selectedQR.scansCount} kali
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Waktu Tersisa
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {getTimeRemaining(selectedQR.expiresAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Dibuat
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(selectedQR.generatedAt).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Petunjuk Penggunaan:
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            Tampilkan QR code ini kepada peserta meeting
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            Peserta dapat scan menggunakan aplikasi kamera
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            QR code akan expired setelah meeting selesai
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            Download atau share QR code jika diperlukan
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Pilih meeting untuk menampilkan QR code
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}