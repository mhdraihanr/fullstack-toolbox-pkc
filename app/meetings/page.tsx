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
import { formatRelativeTime } from "../../lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/Popover";

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

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      try {
        const result = await getMeetingsWithUsers({ limit: 100 });
        setMeetings(result.data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const allMeetings = meetings;

  const filteredMeetings = useMemo(() => {
    return allMeetings.filter((meeting) => {
      if (
        searchQuery &&
        !meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !meeting.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.status &&
        filters.status.length > 0 &&
        !filters.status.includes(meeting.status)
      ) {
        return false;
      }

      if (
        filters.meeting_type &&
        filters.meeting_type.length > 0 &&
        !filters.meeting_type.includes(meeting.meeting_type)
      ) {
        return false;
      }

      if (filters.created_by && meeting.created_by !== filters.created_by) {
        return false;
      }

      return true;
    });
  }, [allMeetings, searchQuery, filters]);

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
    <div className="space-y-4 sm:space-y-6 dark:bg-[#1E1E2D] dark:text-white min-h-screen p-4 sm:p-6 lg:p-8">
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

      <div className="flex flex-col space-y-3 sm:flex-row sm:gap-4 sm:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Cari meeting..."
            className="pl-10 pr-4 py-2 w-full border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="whiteLine" className="w-full sm:w-auto">
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
                        checked={filters.status?.includes(status) || false}
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
                <label className="text-sm font-medium">Tipe Meeting</label>
                <div className="mt-2 space-y-2">
                  {typeOptions.map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filters.meeting_type?.includes(type) || false}
                        onChange={(e) => {
                          const newType = e.target.checked
                            ? [...(filters.meeting_type || []), type]
                            : (filters.meeting_type || []).filter(
                                (t) => t !== type
                              );
                          setFilters({ ...filters, meeting_type: newType });
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

      <div className="bg-card rounded-lg shadow border border-border">
        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-3 p-3 border-b font-medium text-xs">
          <div className="col-span-2">Status</div>
          <div className="col-span-3">
            <button
              className="flex items-center gap-1 hover:text-primary"
              onClick={() => toggleSort("title")}
            >
              Judul & Deskripsi
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
          <div className="col-span-2">
            <button
              className="flex items-center gap-1 hover:text-blue-600"
              onClick={() => toggleSort("date_time")}
            >
              Waktu
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
          <div className="col-span-2">Lokasi</div>
          <div className="col-span-2">Tipe</div>
          <div className="col-span-1">Aksi</div>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Memuat meetings...
              </p>
            </div>
          ) : (
            sortedMeetings.map((meeting) => (
              <div key={meeting.id}>
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-12 gap-3 p-3 hover:bg-muted/50 items-center">
                  <div className="col-span-2">
                    <Badge
                      className={`${getStatusColor(meeting.status)} text-xs`}
                    >
                      {meeting.status}
                    </Badge>
                  </div>

                  <div className="mr-5 col-span-3 min-w-0">
                    <div className="space-y-0.5">
                      <h3 className="font-medium text-sm truncate">
                        {meeting.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {meeting.description}
                      </p>
                    </div>
                  </div>

                  <div className="ml-2 col-span-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate">
                        {formatRelativeTime(meeting.date_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>{formatDuration(meeting.duration)}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-xs">
                      {getTypeIcon(meeting.meeting_type)}
                      <span className="truncate">{meeting.location}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Badge variant="outline" className="capitalize text-xs">
                      {meeting.meeting_type}
                    </Badge>
                  </div>

                  <div className="col-span-1 mr-4">
                    <Link href={`/meetings/${meeting.id}`}>
                      <Button
                        variant="whiteLine"
                        size="sm"
                        className="w-full text-xs px-5 py-1"
                      >
                        Detail
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden p-3 sm:p-4 hover:bg-muted/50">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">
                          {meeting.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                          {meeting.description}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusColor(
                          meeting.status
                        )} text-xs flex-shrink-0`}
                      >
                        {meeting.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span>{formatRelativeTime(meeting.date_time)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span>{formatDuration(meeting.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(meeting.meeting_type)}
                        <span className="truncate">{meeting.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="capitalize text-xs">
                          {meeting.meeting_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link href={`/meetings/${meeting.id}`}>
                        <Button
                          variant="whiteLine"
                          size="sm"
                          className="text-xs sm:text-sm"
                        >
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && sortedMeetings.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
              Tidak ada meeting
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Tidak ada meeting yang sesuai dengan filter Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
