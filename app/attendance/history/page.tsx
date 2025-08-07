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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Riwayat Kehadiran
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Riwayat kehadiran meeting dengan QR code
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={refreshData}
            variant="whiteLine"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={exportAttendanceData}
            variant="whiteLine"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500">
        Terakhir diperbarui: {formatRelativeTime(lastUpdated.toISOString())}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Kehadiran
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttendees}</div>
            <p className="text-xs text-muted-foreground">peserta hadir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tepat Waktu</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.onTimeAttendees}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAttendees > 0
                ? Math.round(
                    (stats.onTimeAttendees / stats.totalAttendees) * 100
                  )
                : 0}
              % dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.lateAttendees}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAttendees > 0
                ? Math.round((stats.lateAttendees / stats.totalAttendees) * 100)
                : 0}
              % dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Code Scans</CardTitle>
            <QrCode className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.qrCodeScans}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAttendees > 0
                ? Math.round((stats.qrCodeScans / stats.totalAttendees) * 100)
                : 0}
              % via QR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Aktif</CardTitle>
            <Smartphone className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.activeQRCodes}
            </div>
            <p className="text-xs text-muted-foreground">kode tersedia</p>
          </CardContent>
        </Card>
      </div>

      {/* Active QR Codes */}
      {qrCodes.filter((q) => q.isActive).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {qrCodes
                .filter((q) => q.isActive)
                .map((qr) => (
                  <div
                    key={qr.meetingId}
                    className="border rounded-lg p-4 text-center"
                  >
                    <img
                      src={qr.qrCodeUrl}
                      alt={`QR Code for ${qr.meetingTitle}`}
                      className="w-32 h-32 mx-auto mb-3"
                    />
                    <h4 className="font-medium text-sm mb-2">
                      {qr.meetingTitle}
                    </h4>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-2">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(qr.expiresAt).toLocaleTimeString()}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {qr.scansCount} scans
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama, meeting, atau departemen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            title="Pilih Meeting"
            value={selectedMeeting || ""}
            onChange={(e) => setSelectedMeeting(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Meeting</option>
            {meetings.map((meeting) => (
              <option key={meeting.id} value={meeting.id}>
                {meeting.title}
              </option>
            ))}
          </select>
          <select
            title="Filter Status"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as "all" | "present" | "late" | "absent"
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="present">Tepat Waktu</option>
            <option value="late">Terlambat</option>
          </select>
        </div>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Riwayat Kehadiran ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Memuat data attendance...</p>
            </div>
          )}
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data kehadiran yang sesuai dengan filter
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={record.userAvatar}
                      alt={record.userName}
                      fallback={record.userName.charAt(0)}
                      size="md"
                    />
                    <div>
                      <h4 className="font-medium">{record.userName}</h4>
                      <p className="text-sm text-gray-600">
                        {record.meetingTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {record.department}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {record.location?.address}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={getCheckInMethodColor(record.checkInMethod)}
                      >
                        <div className="flex items-center gap-1">
                          {getCheckInMethodIcon(record.checkInMethod)}
                          {record.checkInMethod.replace("_", " ")}
                        </div>
                      </Badge>
                      {record.isLate ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Terlambat
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Tepat Waktu
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(record.checkedInAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {record.deviceInfo}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
