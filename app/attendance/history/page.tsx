"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Users,
  Clock,
  MapPin,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  UserCheck,
  Timer,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/Avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import {
  getMeetingsWithUsers,
  getUsers,
} from "../../meetings/data";
import { Meeting, MeetingAttendance, User } from "../../../types";
import { formatRelativeTime } from "../../../lib/utils";

interface AttendanceRecord {
  id: string;
  meetingId: string;
  meetingTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  department?: string;
  checkedInAt: string;
  checkInMethod: "qr_code" | "manual" | "auto";
  isLate: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  deviceInfo?: string;
}

interface QRCodeData {
  meetingId: string;
  meetingTitle: string;
  qrCodeUrl: string;
  expiresAt: string;
  isActive: boolean;
  scansCount: number;
}

export default function AttendanceHistoryPage() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "present" | "late" | "absent"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Generate mock attendance data
  const generateAttendanceData = (meetings: Meeting[]): AttendanceRecord[] => {
    const users = getUsers();
    const records: AttendanceRecord[] = [];

    meetings.forEach((meeting) => {
      // Simulate 70-90% attendance rate
      const attendanceRate = 0.7 + Math.random() * 0.2;
      const attendingUsers = users.slice(
        0,
        Math.floor(users.length * attendanceRate)
      );

      attendingUsers.forEach((user, index) => {
        const checkedInAt = new Date(meeting.date_time);
        checkedInAt.setMinutes(
          checkedInAt.getMinutes() + (Math.random() * 30 - 10)
        ); // -10 to +20 minutes

        const isLate = checkedInAt > new Date(meeting.date_time);
        const checkInMethods: ("qr_code" | "manual" | "auto")[] = [
          "qr_code",
          "manual",
          "auto",
        ];
        const randomMethod =
          checkInMethods[Math.floor(Math.random() * checkInMethods.length)];

        records.push({
          id: `${meeting.id}-${user.id}`,
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar_url,
          department: user.department,
          checkedInAt: checkedInAt.toISOString(),
          checkInMethod: randomMethod,
          isLate,
          location: {
            lat: -6.2088 + (Math.random() - 0.5) * 0.01,
            lng: 106.8456 + (Math.random() - 0.5) * 0.01,
            address: "PT Pupuk Kujang, Cikampek",
          },
          deviceInfo: `${Math.random() > 0.5 ? "Android" : "iOS"} Mobile App`,
        });
      });
    });

    return records.sort(
      (a, b) =>
        new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()
    );
  };

  // Generate mock QR codes
  const generateQRCodes = (meetings: Meeting[]): QRCodeData[] => {
    return meetings
      .filter((m) => m.status === "scheduled" || m.status === "in-progress")
      .map((meeting) => {
        const expiresAt = new Date(meeting.date_time);
        expiresAt.setHours(
          expiresAt.getHours() + Math.floor(meeting.duration / 60) + 1
        );

        return {
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=meeting-${meeting.id}`,
          expiresAt: expiresAt.toISOString(),
          isActive: new Date() < expiresAt,
          scansCount: Math.floor(Math.random() * 20) + 5,
        };
      });
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const result = await getMeetingsWithUsers({ limit: 100 });
      const meetingsData = result.data;
      setMeetings(meetingsData);
      setAttendanceRecords(generateAttendanceData(meetingsData));
      setQRCodes(generateQRCodes(meetingsData));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "present" && !record.isLate) ||
      (filterStatus === "late" && record.isLate);

    const matchesMeeting =
      !selectedMeeting || record.meetingId === selectedMeeting;

    return matchesSearch && matchesFilter && matchesMeeting;
  });

  // Calculate statistics
  const stats = {
    totalAttendees: attendanceRecords.length,
    onTimeAttendees: attendanceRecords.filter((r) => !r.isLate).length,
    lateAttendees: attendanceRecords.filter((r) => r.isLate).length,
    qrCodeScans: attendanceRecords.filter((r) => r.checkInMethod === "qr_code")
      .length,
    activeQRCodes: qrCodes.filter((q) => q.isActive).length,
  };

  const getCheckInMethodIcon = (method: string) => {
    switch (method) {
      case "qr_code":
        return <QrCode className="w-4 h-4" />;
      case "manual":
        return <UserCheck className="w-4 h-4" />;
      case "auto":
        return <Timer className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getCheckInMethodColor = (method: string) => {
    switch (method) {
      case "qr_code":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "manual":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "auto":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const exportAttendanceData = () => {
    const csvContent = [
      [
        "Meeting",
        "Name",
        "Department",
        "Check-in Time",
        "Method",
        "Status",
        "Location",
      ].join(","),
      ...filteredRecords.map((record) =>
        [
          record.meetingTitle,
          record.userName,
          record.department || "",
          new Date(record.checkedInAt).toLocaleString(),
          record.checkInMethod,
          record.isLate ? "Late" : "On Time",
          record.location?.address || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Riwayat Kehadiran
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Riwayat kehadiran meeting dengan QR code
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full inline-block">
            Terakhir diperbarui: {formatRelativeTime(lastUpdated.toISOString())}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <Button
            onClick={refreshData}
            variant="whiteLine"
            size="sm"
            className="flex items-center justify-center gap-2 min-w-[120px]"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={exportAttendanceData}
            variant="whiteLine"
            size="sm"
            className="flex items-center justify-center gap-2 min-w-[120px]"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Kehadiran
            </CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalAttendees}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">peserta hadir</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Tepat Waktu</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.onTimeAttendees}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.totalAttendees > 0
                ? Math.round(
                    (stats.onTimeAttendees / stats.totalAttendees) * 100
                  )
                : 0}
              % dari total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Terlambat</CardTitle>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.lateAttendees}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.totalAttendees > 0
                ? Math.round((stats.lateAttendees / stats.totalAttendees) * 100)
                : 0}
              % dari total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">QR Code Scans</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.qrCodeScans}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.totalAttendees > 0
                ? Math.round((stats.qrCodeScans / stats.totalAttendees) * 100)
                : 0}
              % via QR
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">QR Aktif</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.activeQRCodes}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">kode tersedia</p>
          </CardContent>
        </Card>
      </div>

      {/* Active QR Codes */}
      {qrCodes.filter((q) => q.isActive).length > 0 && (
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <QrCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              QR Code Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {qrCodes
                .filter((q) => q.isActive)
                .map((qr) => (
                  <div
                    key={qr.meetingId}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
                  >
                    <div className="bg-white p-3 rounded-lg shadow-sm mb-4 inline-block">
                      <img
                        src={qr.qrCodeUrl}
                        alt={`QR Code for ${qr.meetingTitle}`}
                        className="w-28 h-28 mx-auto"
                      />
                    </div>
                    <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white line-clamp-2">
                      {qr.meetingTitle}
                    </h4>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                      <Clock className="w-4 h-4" />
                      Expires: {new Date(qr.expiresAt).toLocaleTimeString()}
                    </div>
                    <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700">
                      {qr.scansCount} scans
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama, meeting, atau departemen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Meeting
              </label>
              <select
                title="Pilih Meeting"
                value={selectedMeeting || ""}
                onChange={(e) => setSelectedMeeting(e.target.value || null)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Semua Meeting</option>
                {meetings.map((meeting) => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                title="Filter Status"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "present" | "late" | "absent"
                  )
                }
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Semua Status</option>
                <option value="present">Tepat Waktu</option>
                <option value="late">Terlambat</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="w-5 h-5" />
            Riwayat Kehadiran ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading && (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Memuat data attendance...</p>
            </div>
          )}
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-base font-medium mb-1">Tidak ada data kehadiran</p>
                <p className="text-sm">Tidak ada data kehadiran yang sesuai dengan filter yang dipilih</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <Card
                  key={record.id}
                  className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 dark:border-l-blue-400"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <Avatar
                        src={record.userAvatar}
                        alt={record.userName}
                        fallback={record.userName.charAt(0)}
                        size="md"
                        className="ring-2 ring-gray-100 dark:ring-gray-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                            {record.userName}
                          </h3>
                          {record.isLate ? (
                            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 px-2 py-0.5 text-xs font-medium w-fit">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Terlambat
                            </Badge>
                          ) : (
                            <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 px-2 py-0.5 text-xs font-medium w-fit">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Tepat Waktu
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 truncate">
                          {record.meetingTitle}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="p-1 bg-blue-50 dark:bg-blue-900/20 rounded">
                              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="truncate">{record.department}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="p-1 bg-green-50 dark:bg-green-900/20 rounded">
                              <MapPin className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="truncate">{record.location?.address}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className={`p-1 rounded ${
                              record.checkInMethod === "qr_code" 
                                ? "bg-purple-50 dark:bg-purple-900/20" 
                                : record.checkInMethod === "manual"
                                ? "bg-orange-50 dark:bg-orange-900/20"
                                : "bg-indigo-50 dark:bg-indigo-900/20"
                            }`}>
                              {getCheckInMethodIcon(record.checkInMethod)}
                            </div>
                            <span className="truncate capitalize">{record.checkInMethod.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1.5 lg:min-w-[140px]">
                      <div className="text-right">
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {new Date(record.checkedInAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(record.checkedInAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                      </div>
                      <Badge
                          className={`${getCheckInMethodColor(record.checkInMethod)} text-xs font-medium`}
                        >
                          <div className="flex items-center gap-1">
                            {getCheckInMethodIcon(record.checkInMethod)}
                            {record.checkInMethod}
                          </div>
                        </Badge>
                      {record.deviceInfo && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded text-center max-w-[120px] truncate">
                          {record.deviceInfo}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
