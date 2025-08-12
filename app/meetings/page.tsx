"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Plus,
  Filter,
  Search,
  Clock,
  Users,
  MapPin,
  Video,
  ArrowUpDown,
  AlertTriangle,
  X,
  ChevronDown,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { getMeetingsWithUsers } from "./data";
import { Meeting, MeetingFilters, User } from "../../types";
import { formatRelativeTime, formatMeetingTime, isMeetingPastOrCompleted } from "../../lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/Popover";
import { useMeetings } from "../../lib/hooks/useMeetings";

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<MeetingFilters>({
    status: undefined,
    meeting_type: undefined,
    created_by: undefined,
  });

  const statusOptions: Meeting["status"][] = [
    "scheduled",
    "in-progress",
    "completed",
    "cancelled",
  ];

  const typeOptions: Meeting["meeting_type"][] = [
    "onsite",
    "virtual",
    "hybrid",
  ];

  const [sortBy, setSortBy] = useState<{
    field: keyof Meeting | "creator";
    direction: "asc" | "desc";
  }>({
    field: "date_time",
    direction: "asc",
  });

  // Use the useMeetings hook
  const {
    meetings: allMeetings,
    loading,
    error,
    updateMeetingStatus,
    refetch,
  } = useMeetings({
    limit: 1000,
    clientSideSearch: true,
    search: searchQuery,
    status: filters.status?.join(","),
    meeting_type: filters.meeting_type?.join(","),
    created_by: filters.created_by,
  });

  // Handle status update
  const handleStatusUpdate = async (
    meetingId: string,
    newStatus: Meeting["status"]
  ) => {
    try {
      await updateMeetingStatus(meetingId, newStatus);
      // The hook will automatically update the local state
    } catch (error) {
      console.error("Error updating meeting status:", error);
      // You could add a toast notification here
      alert("Gagal mengupdate status meeting. Silakan coba lagi.");
    }
  };

  // Function to get status label in Indonesian
  const getStatusLabel = (status: Meeting["status"]) => {
    switch (status) {
      case "scheduled":
        return "Terjadwal";
      case "in-progress":
        return "Berlangsung";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  // The filtering is now handled by the useMeetings hook
  const filteredMeetings = allMeetings;

  const sortedMeetings = useMemo(() => {
    return [...filteredMeetings].sort((a, b) => {
      let aValue: string | number | Date | undefined;
      let bValue: string | number | Date | undefined;

      if (sortBy.field === "creator") {
        aValue = a.creator?.name || "";
        bValue = b.creator?.name || "";
      } else {
        aValue = a[sortBy.field as keyof Meeting] as
          | string
          | number
          | Date
          | undefined;
        bValue = b[sortBy.field as keyof Meeting] as
          | string
          | number
          | Date
          | undefined;
      }

      if (sortBy.field === "date_time" || sortBy.field === "created_at") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (sortBy.direction === "asc") {
        return aValue !== undefined && bValue !== undefined
          ? aValue > bValue
            ? 1
            : -1
          : 0;
      } else {
        return aValue !== undefined && bValue !== undefined
          ? aValue < bValue
            ? 1
            : -1
          : 0;
      }
    });
  }, [filteredMeetings, sortBy]);

  const toggleSort = (field: keyof Meeting | "creator") => {
    if (sortBy.field === field) {
      setSortBy({
        field,
        direction: sortBy.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortBy({
        field,
        direction: "asc",
      });
    }
  };

  const getStatusColor = (status: Meeting["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: Meeting["meeting_type"]) => {
    switch (type) {
      case "virtual":
        return <Video className="w-4 h-4" />;
      case "onsite":
        return <MapPin className="w-4 h-4" />;
      case "hybrid":
        return <Users className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDuration = (duration: number) => {
    return `${duration} menit`;
  };

  return (
    <div className="space-y-4 sm:space-y-6  dark:text-white min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Meetings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Kelola dan pantau semua meeting perusahaan
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Link href="/notulensi">
            <Button
              variant="whiteLine"
              className="w-full sm:w-auto cursor-pointer"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Notulensi</span>
              <span className="sm:hidden">Notes</span>
            </Button>
          </Link>
          <Link href="/meetings/create">
            <Button className="w-full sm:w-auto cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create new Meeting</span>
              <span className="sm:hidden">Create Meeting</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari meeting..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="whiteLine" className="rounded-lg">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div className="mt-2 space-y-2">
                        {statusOptions.map((status) => (
                          <label key={status} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={
                                filters.status?.includes(status) || false
                              }
                              onChange={(e) => {
                                const newStatus = e.target.checked
                                  ? [...(filters.status || []), status]
                                  : (filters.status || []).filter(
                                      (s) => s !== status
                                    );
                                setFilters({ ...filters, status: newStatus });
                              }}
                            />
                            <span className="text-sm capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Tipe Meeting
                      </label>
                      <div className="mt-2 space-y-2">
                        {typeOptions.map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={
                                filters.meeting_type?.includes(type) || false
                              }
                              onChange={(e) => {
                                const newType = e.target.checked
                                  ? [...(filters.meeting_type || []), type]
                                  : (filters.meeting_type || []).filter(
                                      (t) => t !== type
                                    );
                                setFilters({
                                  ...filters,
                                  meeting_type: newType,
                                });
                              }}
                            />
                            <span className="text-sm capitalize">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daftar Meetings ({sortedMeetings.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 w-40">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Status
                    </span>
                  </th>
                  <th className="text-left py-4 px-4 w-auto">
                    <button
                      onClick={() => toggleSort("title")}
                      className="flex items-center gap-1 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Judul & Deskripsi
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 w-44">
                    <button
                      onClick={() => toggleSort("date_time")}
                      className="flex items-center gap-1 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Waktu
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 w-40">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Lokasi
                    </span>
                  </th>
                  <th className="text-left py-4 px-4 w-36">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Tipe
                    </span>
                  </th>
                  <th className="text-left py-4 px-4 w-24">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Aksi
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 sm:py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">
                        Memuat meetings...
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedMeetings.map((meeting) => (
                    <tr
                      key={meeting.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-5 px-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                              <Badge
                                className={`${getStatusColor(
                                  meeting.status
                                )} text-xs cursor-pointer whitespace-nowrap`}
                              >
                                {getStatusLabel(meeting.status)}
                              </Badge>
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-1">
                            <div className="space-y-1">
                              {statusOptions.map((status) => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    handleStatusUpdate(meeting.id, status)
                                  }
                                  className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors ${
                                    meeting.status === status
                                      ? "bg-muted font-medium"
                                      : ""
                                  }`}
                                >
                                  <Badge
                                    className={`${getStatusColor(
                                      status
                                    )} text-xs`}
                                  >
                                    {getStatusLabel(status)}
                                  </Badge>
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="py-5 px-4">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {meeting.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {meeting.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className={`truncate ${
                              isMeetingPastOrCompleted(meeting.date_time, meeting.status) 
                                ? 'text-red-600 dark:text-red-400' 
                                : ''
                            }`}>
                              {formatMeetingTime(meeting.date_time, meeting.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span>{formatDuration(meeting.duration)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                          {getTypeIcon(meeting.meeting_type)}
                          <span className="truncate">{meeting.location}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <Badge
                          variant="outline"
                          className="capitalize text-xs whitespace-nowrap"
                        >
                          {meeting.meeting_type}
                        </Badge>
                      </td>
                      <td className="py-5 px-4">
                        <Link href={`/meetings/${meeting.id}`}>
                          <Button
                            variant="whiteLine"
                            size="sm"
                            className="flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Detail</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {!loading && sortedMeetings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada meeting
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Tidak ada meeting yang sesuai dengan filter Anda.
                </p>
              </div>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {sortedMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-[#1E1E2D]"
              >
                <div className="space-y-3">
                  {/* Meeting Title and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {meeting.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {meeting.description}
                      </p>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                          <Badge
                            className={`${getStatusColor(
                              meeting.status
                            )} text-xs whitespace-nowrap cursor-pointer`}
                          >
                            {getStatusLabel(meeting.status)}
                          </Badge>
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-1">
                        <div className="space-y-1">
                          {statusOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                handleStatusUpdate(meeting.id, status)
                              }
                              className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors ${
                                meeting.status === status
                                  ? "bg-muted font-medium"
                                  : ""
                              }`}
                            >
                              <Badge
                                className={`${getStatusColor(status)} text-xs`}
                              >
                                {getStatusLabel(status)}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Meeting Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        Waktu:
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className={`${
                          isMeetingPastOrCompleted(meeting.date_time, meeting.status)
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {formatMeetingTime(meeting.date_time, meeting.status)}
                        </span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        Durasi:
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-gray-900 dark:text-white">
                          {formatDuration(meeting.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        Lokasi:
                      </span>
                      <div className="flex items-center gap-1 min-w-0">
                        {getTypeIcon(meeting.meeting_type)}
                        <span className="text-gray-900 dark:text-white truncate">
                          {meeting.location}
                        </span>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        Tipe:
                      </span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {meeting.meeting_type}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Link href={`/meetings/${meeting.id}`}>
                      <Button
                        variant="whiteLine"
                        size="sm"
                        className="flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Detail</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {sortedMeetings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada meeting
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || Object.values(filters).some(Boolean)
                    ? "Tidak ada meeting yang sesuai dengan filter Anda."
                    : "Belum ada meeting yang dibuat."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
