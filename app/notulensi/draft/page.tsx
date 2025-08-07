"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
// Table components not available - using regular HTML table
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Avatar } from "@/components/ui/Avatar";
import {
  Search,
  Edit,
  Trash2,
  FileText,
  Calendar,
  User,
  Clock,
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useNotulensi } from "@/lib/hooks/useNotulensi";
import { Notulensi } from "@/types";
import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function DraftNotulensiPage() {
  const router = useRouter();
  const { 
    notulensi, 
    loading, 
    error, 
    deleteNotulensi, 
    refetch 
  } = useNotulensi({ 
    clientSideSearch: true, 
    limit: 1000,
    is_draft: true 
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<{
    field: "title" | "creator" | "created_at" | "updated_at" | "meeting_title";
    direction: "asc" | "desc";
  }>({
    field: "created_at",
    direction: "desc",
  });

  // Filter drafts from notulensi data
  const draftList = notulensi.filter(item => item.is_draft);
  
  useEffect(() => {
    refetch();
  }, []);

  const filteredDrafts = useMemo(() => {
    return draftList.filter((draft) => {
      if (
        searchQuery &&
        !draft.meeting?.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !draft.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [draftList, searchQuery]);

  const sortedDrafts = useMemo(() => {
    return [...filteredDrafts].sort((a, b) => {
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
  }, [filteredDrafts, sortBy]);

  const toggleSort = (field: "title" | "creator" | "created_at" | "updated_at" | "meeting_title") => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    return date.toLocaleDateString("id-ID");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotulensi(id);
      alert("Draft berhasil dihapus!");
      refetch(); // Refresh data
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Gagal menghapus draft. Silakan coba lagi.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Memuat draft notulensi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => refetch()} variant="outline">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/notulensi">
            <Button variant="whiteLine" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Draft Notulensi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Kelola draft notulensi yang belum selesai
            </p>
          </div>
        </div>
        <Link href="/notulensi/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Notulensi Baru
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari draft..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Draft
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {draftList.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Perlu Diselesaikan
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    draftList.filter(
                      (d) => !d.content || d.content.trim().length < 100
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Siap Dipublikasi
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    draftList.filter(
                      (d) => d.content && d.content.trim().length >= 100
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Draft List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Draft Notulensi ({sortedDrafts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDrafts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Tidak ada draft ditemukan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery
                  ? "Coba ubah kata kunci pencarian"
                  : "Mulai buat notulensi baru untuk menyimpan draft"}
              </p>
              <Link href="/notulensi/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Notulensi Baru
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {draft.meeting?.title || "Rapat Tidak Diketahui"}
                        </h3>
                        <Badge
                          status="draft"
                          className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                        >
                          Draft
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>
                            Dibuat oleh:{" "}
                            {draft.creator?.name || "Tidak diketahui"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Terakhir diubah:{" "}
                            {formatRelativeTime(draft.updated_at)}
                          </span>
                        </div>
                        {draft.meeting?.date_time && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(draft.meeting.date_time)}</span>
                          </div>
                        )}
                      </div>

                      {draft.content && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                          {draft.content.substring(0, 150)}...
                        </p>
                      )}

                      {draft.action_items && draft.action_items.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {draft.action_items.length} action item(s)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="whiteLine" 
                        size="sm"
                        onClick={() => router.push(`/notulensi/create?draft=${draft.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="whiteLine"
                        size="sm"
                        onClick={() => handleDelete(draft.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
