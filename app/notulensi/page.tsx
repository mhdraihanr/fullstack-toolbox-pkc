"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Plus,
  Filter,
  Search,
  Clock,
  Users,
  CheckCircle,
  ArrowUpDown,
  Eye,
  X,
  Calendar,
  User,
  Download,
  MessageCircle,
  Mail,
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
import { Notulensi, Meeting } from "../../types";
import { formatRelativeTime } from "../../lib/utils";
import { useNotulensi } from "../../lib/hooks/useNotulensi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/Popover";

export default function NotulensiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    approved?: boolean;
    created_by?: string;
  }>({
    approved: undefined,
    created_by: undefined,
  });

  const [sortBy, setSortBy] = useState<{
    field: keyof Notulensi | "creator" | "meeting_title";
    direction: "asc" | "desc";
  }>({
    field: "created_at",
    direction: "desc",
  });

  const {
    notulensi: allNotulensi,
    loading,
    error,
    refetch,
    deleteNotulensi,
    approveNotulensi,
    unapproveNotulensi,
    exportToPDF
  } = useNotulensi({
    clientSideSearch: true,
    limit: 1000
  });

  const filteredNotulensi = useMemo(() => {
    if (!allNotulensi || !Array.isArray(allNotulensi)) {
      return [];
    }
    return allNotulensi.filter((notulensi) => {
      if (
        searchQuery &&
        !notulensi.meeting?.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !notulensi.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (filters.approved !== undefined) {
        const isApproved = !!notulensi.approved_at;
        if (filters.approved !== isApproved) {
          return false;
        }
      }

      if (filters.created_by && notulensi.created_by !== filters.created_by) {
        return false;
      }

      return true;
    });
  }, [allNotulensi, searchQuery, filters]);

  const sortedNotulensi = useMemo(() => {
    return [...filteredNotulensi].sort((a, b) => {
      let aValue: string | number | Date | undefined;
      let bValue: string | number | Date | undefined;

      if (sortBy.field === "creator") {
        aValue = a.creator?.name || "";
        bValue = b.creator?.name || "";
      } else if (sortBy.field === "meeting_title") {
        aValue = a.meeting?.title || "";
        bValue = b.meeting?.title || "";
      } else {
        aValue = a[sortBy.field as keyof Notulensi] as
          | string
          | number
          | Date
          | undefined;
        bValue = b[sortBy.field as keyof Notulensi] as
          | string
          | number
          | Date
          | undefined;
      }

      if (sortBy.field === "created_at" || sortBy.field === "updated_at") {
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
  }, [filteredNotulensi, sortBy]);

  const toggleSort = (field: keyof Notulensi | "creator" | "meeting_title") => {
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

  const getApprovalStatus = (notulensi: Notulensi) => {
    if (notulensi.approved_at) {
      return {
        label: "Approved",
        status: "completed" as const,
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      };
    }
    return {
      label: "Pending Approval",
      status: "pending" as const,
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Modal state and functions
  const [selectedNotulensi, setSelectedNotulensi] = useState<Notulensi | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetail = (notulensi: Notulensi) => {
    setSelectedNotulensi(notulensi);
    setIsDetailOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      approved: undefined,
      created_by: undefined,
    });
    setSearchQuery("");
  };

  const toggleApprovalFilter = (approved: boolean) => {
    setFilters((prev) => ({
      ...prev,
      approved: prev.approved === approved ? undefined : approved,
    }));
  };

  // Handler functions
  const handleExportPDF = async (notulensi: Notulensi) => {
    try {
      const success = await exportToPDF(notulensi.id);
      if (success) {
        alert("Notulensi berhasil diexport sebagai PDF.");
      } else {
        alert("Gagal mengexport notulensi.");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Gagal mengexport notulensi.");
    }
  };

  const handleApprove = async (notulensi: Notulensi) => {
    try {
      if (notulensi.approved_at) {
        await unapproveNotulensi(notulensi.id);
        alert("Approval notulensi berhasil dibatalkan.");
      } else {
        await approveNotulensi(notulensi.id);
        alert("Notulensi berhasil diapprove.");
      }
    } catch (error) {
      console.error("Error updating approval:", error);
      alert("Gagal mengupdate approval notulensi.");
    }
  };

  const handleDelete = async (notulensi: Notulensi) => {
    if (confirm(`Apakah Anda yakin ingin menghapus notulensi "${notulensi.meeting?.title || 'Rapat'}"?`)) {
      try {
        const success = await deleteNotulensi(notulensi.id);
        if (success) {
          alert("Notulensi berhasil dihapus.");
        } else {
          alert("Gagal menghapus notulensi.");
        }
      } catch (error) {
        console.error("Error deleting notulensi:", error);
        alert("Gagal menghapus notulensi.");
      }
    }
  };

  const shareToWhatsApp = (notulensi: Notulensi) => {
    const message =
      `*Notulensi Rapat*\n\n` +
      `*Judul:* ${notulensi.meeting?.title || "Rapat Tidak Diketahui"}\n` +
      `*Tanggal:* ${
        notulensi.meeting?.date_time
          ? formatDate(notulensi.meeting.date_time)
          : "Tidak diketahui"
      }\n` +
      `*Dibuat oleh:* ${notulensi.creator?.name || "Tidak diketahui"}\n\n` +
      `*Isi Notulensi:*\n${notulensi.content}\n\n` +
      (notulensi.decisions && notulensi.decisions.length > 0
        ? `*Keputusan Rapat:*\n${notulensi.decisions
            .map((decision, index) => `${index + 1}. ${decision}`)
            .join("\n")}\n\n`
        : "") +
      (notulensi.action_items && notulensi.action_items.length > 0
        ? `*Action Items:*\n${notulensi.action_items
            .map(
              (item) =>
                `• ${item.description}\n  Assignee: ${
                  item.assignee?.name || "Not assigned"
                }\n  Deadline: ${
                  item.due_date ? formatDate(item.due_date) : "Not set"
                }`
            )
            .join("\n\n")}`
        : "");

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareToEmail = (notulensi: Notulensi) => {
    const subject = `Notulensi Rapat - ${notulensi.meeting?.title || "Rapat"}`;
    const body =
      `Notulensi Rapat\n\n` +
      `Judul: ${notulensi.meeting?.title || "Rapat Tidak Diketahui"}\n` +
      `Tanggal: ${
        notulensi.meeting?.date_time
          ? formatDate(notulensi.meeting.date_time)
          : "Tidak diketahui"
      }\n` +
      `Dibuat oleh: ${notulensi.creator?.name || "Tidak diketahui"}\n\n` +
      `Isi Notulensi:\n${notulensi.content}\n\n` +
      (notulensi.decisions && notulensi.decisions.length > 0
        ? `Keputusan Rapat:\n${notulensi.decisions
            .map((decision, index) => `${index + 1}. ${decision}`)
            .join("\n")}\n\n`
        : "") +
      (notulensi.action_items && notulensi.action_items.length > 0
        ? `Action Items:\n${notulensi.action_items
            .map(
              (item) =>
                `• ${item.description}\n  Assignee: ${
                  item.assignee?.name || "Not assigned"
                }\n  Deadline: ${
                  item.due_date ? formatDate(item.due_date) : "Not set"
                }`
            )
            .join("\n\n")}`
        : "");

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
    window.open(mailtoUrl);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat notulensi...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notulensi Rapat
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola dan lihat notulensi dari semua rapat
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/notulensi/draft">
            <Button variant="whiteLine" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Draft Notulensi
            </Button>
          </Link>
          <Link href="/notulensi/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Buat Notulensi
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari notulensi atau rapat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Approval Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="whiteLine"
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Status Persetujuan
                    {filters.approved !== undefined && (
                      <Badge variant="secondary" className="ml-1">
                        1
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Status Persetujuan</h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleApprovalFilter(true)}
                        className={`w-full text-left px-2 py-1 rounded text-sm ${
                          filters.approved === true
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        Disetujui
                      </button>
                      <button
                        onClick={() => toggleApprovalFilter(false)}
                        className={`w-full text-left px-2 py-1 rounded text-sm ${
                          filters.approved === false
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        Menunggu Persetujuan
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Reset Filters */}
              {(searchQuery || Object.values(filters).some(Boolean)) && (
                <Button
                  variant="whiteLine"
                  onClick={resetFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Notulensi
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allNotulensi.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Disetujui
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allNotulensi.filter((n) => n.approved_at).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Menunggu Persetujuan
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allNotulensi.filter((n) => !n.approved_at).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Action Items
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allNotulensi.reduce(
                    (total, n) => total + (n.action_items?.length || 0),
                    0
                  )}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notulensi List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daftar Notulensi ({sortedNotulensi.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 w-auto">
                    <button
                      onClick={() => toggleSort("meeting_title")}
                      className="flex items-center gap-1 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Rapat
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 w-40">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Status
                    </span>
                  </th>
                  <th className="text-left py-4 px-4 w-40">
                    <button
                      onClick={() => toggleSort("creator")}
                      className="flex items-center gap-1 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Dibuat Oleh
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 w-44">
                    <button
                      onClick={() => toggleSort("created_at")}
                      className="flex items-center gap-1 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Tanggal Dibuat
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 w-36">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Action Items
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
                {sortedNotulensi.map((notulensi) => {
                  const approvalStatus = getApprovalStatus(notulensi);
                  return (
                    <tr
                      key={notulensi.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-5 px-4">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {notulensi.meeting?.title ||
                              "Rapat Tidak Diketahui"}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notulensi.content.substring(0, 100)}...
                          </p>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <Badge
                          className={`${approvalStatus.color} text-xs whitespace-nowrap`}
                        >
                          {approvalStatus.label}
                        </Badge>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            src={notulensi.creator?.avatar_url}
                            alt={notulensi.creator?.name || "Unknown"}
                            fallback={notulensi.creator?.name?.charAt(0) || "?"}
                            size="sm"
                          />
                          <span className="text-sm text-gray-900 dark:text-white truncate">
                            {notulensi.creator?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="hidden sm:block">
                            {formatDate(notulensi.created_at)}
                          </div>
                          <div className="sm:hidden">
                            {formatRelativeTime(notulensi.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {notulensi.action_items?.length || 0} item
                          </span>
                          {(notulensi.action_items?.length || 0) > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs whitespace-nowrap"
                            >
                              {notulensi.action_items?.filter(
                                (item) => item.status === "completed"
                              ).length || 0}{" "}
                              completed
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <Button
                          variant="whiteLine"
                          size="sm"
                          onClick={() => handleViewDetail(notulensi)}
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Detail</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {sortedNotulensi.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada notulensi
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery || Object.values(filters).some(Boolean)
                    ? "Tidak ada notulensi yang sesuai dengan filter Anda."
                    : "Belum ada notulensi yang dibuat."}
                </p>
                {!searchQuery && !Object.values(filters).some(Boolean) && (
                  <Link href="/notulensi/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Notulensi Pertama
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {sortedNotulensi.map((notulensi) => {
              const approvalStatus = getApprovalStatus(notulensi);
              return (
                <div
                  key={notulensi.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-[#1E1E2D]"
                >
                  <div className="space-y-3">
                    {/* Meeting Title and Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                          {notulensi.meeting?.title || "Rapat Tidak Diketahui"}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notulensi.content.substring(0, 100)}...
                        </p>
                      </div>
                      <Badge
                        className={`${approvalStatus.color} text-xs whitespace-nowrap`}
                      >
                        {approvalStatus.label}
                      </Badge>
                    </div>

                    {/* Creator and Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      {/* Creator */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Dibuat oleh:</span>
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            src={notulensi.creator?.avatar_url}
                            alt={notulensi.creator?.name || "Unknown"}
                            fallback={notulensi.creator?.name?.charAt(0) || "?"}
                            size="sm"
                          />
                          <span className="text-gray-900 dark:text-white truncate">
                            {notulensi.creator?.name || "Unknown"}
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Tanggal:</span>
                        <div className="text-gray-600 dark:text-gray-400">
                          <div className="hidden sm:block">
                            {formatDate(notulensi.created_at)}
                          </div>
                          <div className="sm:hidden">
                            {formatRelativeTime(notulensi.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Items and Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                          {notulensi.action_items?.length || 0} action item
                        </span>
                        {(notulensi.action_items?.length || 0) > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs whitespace-nowrap"
                          >
                            {notulensi.action_items?.filter(
                              (item) => item.status === "completed"
                            ).length || 0}{" "}
                            completed
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="whiteLine"
                        size="sm"
                        onClick={() => handleViewDetail(notulensi)}
                        className="flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Detail</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedNotulensi.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada notulensi
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery || Object.values(filters).some(Boolean)
                    ? "Tidak ada notulensi yang sesuai dengan filter Anda."
                    : "Belum ada notulensi yang dibuat."}
                </p>
                {!searchQuery && !Object.values(filters).some(Boolean) && (
                  <Link href="/notulensi/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Notulensi Pertama
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {isDetailOpen && selectedNotulensi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detail Notulensi
                </h2>
                <div className="flex items-center gap-2">
                  {/* Export Buttons */}
                  <Button
                    variant="whiteLine"
                    size="sm"
                    onClick={() => handleExportPDF(selectedNotulensi)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    title="Export ke PDF"
                  >
                    <Download className="w-4 h-4 cursor-pointer" />
                  </Button>
                  <Button
                    variant="whiteLine"
                    size="sm"
                    onClick={() => shareToWhatsApp(selectedNotulensi)}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                    title="Kirim ke WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 cursor-pointer" />
                  </Button>
                  <Button
                    variant="whiteLine"
                    size="sm"
                    onClick={() => shareToEmail(selectedNotulensi)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                    title="Kirim via Email"
                  >
                    <Mail className="w-4 h-4 cursor-pointer" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    <X className="w-4 h-4 cursor-pointer" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Meeting Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Informasi Rapat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {selectedNotulensi.meeting?.title ||
                          "Rapat Tidak Diketahui"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {selectedNotulensi.meeting?.description}
                      </p>
                    </div>
                    {selectedNotulensi.meeting?.date_time && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatDate(selectedNotulensi.meeting.date_time)}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notulensi Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Isi Notulensi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                        {selectedNotulensi.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Decisions */}
                {selectedNotulensi.decisions &&
                  selectedNotulensi.decisions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Keputusan Rapat
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedNotulensi.decisions.map(
                            (decision, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-blue-500 font-medium">
                                  {index + 1}.
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  {decision}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                {/* Action Items */}
                {selectedNotulensi.action_items &&
                  selectedNotulensi.action_items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Action Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedNotulensi.action_items.map((item) => (
                            <div
                              key={item.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="text-gray-900 dark:text-white font-medium">
                                    {item.description}
                                  </p>
                                  {item.assignee && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <User className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.assignee.name}
                                      </span>
                                    </div>
                                  )}
                                  {item.due_date && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Clock className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Deadline: {formatDate(item.due_date)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge
                                    status={item.status}
                                    className={
                                      item.status === "completed"
                                        ? "bg-green-100 text-green-800 dark:bg-green-700/20 dark:text-green-400"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-red-400"
                                    }
                                  >
                                    {item.status === "completed"
                                      ? "Completed"
                                      : "Pending"}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={
                                      item.priority === "high"
                                        ? "border-red-200 text-red-800 dark:border-red-800 dark:text-red-400"
                                        : item.priority === "medium"
                                        ? "border-yellow-200 text-yellow-800 dark:border-yellow-800 dark:text-yellow-400"
                                        : "border-green-200 text-green-800 dark:border-green-800 dark:text-green-400"
                                    }
                                  >
                                    {item.priority === "high"
                                      ? "High"
                                      : item.priority === "medium"
                                      ? "Medium"
                                      : "Low"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Approval Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Status Persetujuan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          status={getApprovalStatus(selectedNotulensi).status}
                          className={getApprovalStatus(selectedNotulensi).color}
                        >
                          {getApprovalStatus(selectedNotulensi).label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Dibuat oleh
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar
                              src={selectedNotulensi.creator?.avatar_url}
                              alt={selectedNotulensi.creator?.name || "Unknown"}
                              fallback={
                                selectedNotulensi.creator?.name?.charAt(0) ||
                                "?"
                              }
                              size="sm"
                            />
                            <span className="text-gray-900 dark:text-white">
                              {selectedNotulensi.creator?.name || "Unknown"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(selectedNotulensi.created_at)}
                          </p>
                        </div>

                        {selectedNotulensi.approved_at &&
                          selectedNotulensi.approver && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Disetujui oleh
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar
                                  src={selectedNotulensi.approver.avatar_url}
                                  alt={selectedNotulensi.approver.name}
                                  fallback={selectedNotulensi.approver.name.charAt(
                                    0
                                  )}
                                  size="sm"
                                />
                                <span className="text-gray-900 dark:text-white">
                                  {selectedNotulensi.approver.name}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDate(selectedNotulensi.approved_at)}
                              </p>
                            </div>
                          )}
                      </div>

                      {selectedNotulensi.next_meeting_date && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Rapat Selanjutnya
                          </p>
                          <p className="text-gray-900 dark:text-white mt-1">
                            {formatDate(selectedNotulensi.next_meeting_date)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
