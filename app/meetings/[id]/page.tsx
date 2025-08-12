"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Edit,
  Trash2,
  QrCode,
  Link as LinkIcon,
  Copy,
  ArrowLeft,
  ExternalLink,
  FileText,
} from "lucide-react";
import Link from "next/link";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import { ConfirmDialog, useToast } from "../../../components/ui";
import { getMeetingById, getUsers, deleteMeeting } from "../data";
import { Meeting, User } from "../../../types";
import { formatRelativeTime, formatMeetingTime, isMeetingPastOrCompleted } from "../../../lib/utils";

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<(Meeting & { creator?: User }) | null>(
    null
  );
  const [participants, setParticipants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    const loadMeeting = async () => {
      setIsLoading(true);
      try {
        const foundMeeting = await getMeetingById(meetingId);

        if (foundMeeting) {
          setMeeting(foundMeeting);

          // Get participants from the meeting data
          const participantUsers =
            (
              foundMeeting as Meeting & {
                participants?: (User | { user: User })[];
              }
            ).participants
              ?.map((p) => (p as { user: User }).user)
              .filter((user): user is User => user !== undefined) || [];
          setParticipants(participantUsers);
        }
      } catch (error) {
        console.error("Error fetching meeting:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeeting();
  }, [meetingId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteMeeting(meetingId);
      
      if (success) {
        showToast('Meeting berhasil dihapus', 'success');
        setTimeout(() => {
          router.push("/meetings");
        }, 1000);
      } else {
        throw new Error('Gagal menghapus meeting');
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      showToast(error instanceof Error ? error.message : 'Gagal menghapus meeting', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyMeetingLink = async () => {
    const meetingUrl = `${window.location.origin}/meetings/${meetingId}`;
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const copyMeetingJoinLink = async () => {
    if (!meeting?.meeting_link) return;

    try {
      await navigator.clipboard.writeText(meeting.meeting_link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy join link:", error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat detail meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Meeting Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-4">
            Meeting yang Anda cari tidak dapat ditemukan.
          </p>
          <Link href="/meetings">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Meetings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="whiteLine"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{meeting.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(meeting.status)}>
                {meeting.status}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {getTypeIcon(meeting.meeting_type)}
                <span className="ml-1">{meeting.meeting_type}</span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/notulensi/create?meetingId=${meetingId}`}>
            <Button variant="whiteLine" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Buat Notulensi
            </Button>
          </Link>
          <Link href={`/meetings/${meetingId}/edit`}>
            <Button variant="whiteLine" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="whiteLine"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus
          </Button>
          <Button variant="whiteLine" size="sm">
            <QrCode className="w-4 h-4 mr-2" />
            QR Check-in
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Detail</TabsTrigger>
          <TabsTrigger value="participants">
            Peserta ({participants.length})
          </TabsTrigger>
          <TabsTrigger value="attendance">Kehadiran</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meeting Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Meeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {formatRelativeTime(meeting.date_time)}
                    </p>
                    <p className={`text-sm ${
                      isMeetingPastOrCompleted(meeting.date_time, meeting.status)
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground'
                    }`}>
                      {formatMeetingTime(meeting.date_time, meeting.status)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{meeting.duration} menit</p>
                    <p className="text-sm text-muted-foreground">
                      Durasi meeting
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{meeting.location}</p>
                    <p className="text-sm text-muted-foreground">
                      Lokasi meeting
                    </p>
                  </div>
                </div>

                {meeting.meeting_link && (
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          Join Meeting
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyMeetingJoinLink}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {meeting.meeting_link}
                      </p>
                    </div>
                  </div>
                )}

                {meeting.creator && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={meeting.creator.avatar_url || ""}
                        alt={meeting.creator.name}
                        name={meeting.creator.name}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">{meeting.creator.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Pembuat meeting
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description & Agenda */}
            <Card>
              <CardHeader>
                <CardTitle>Deskripsi & Agenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {meeting.description && (
                  <div>
                    <h4 className="font-medium mb-2">Deskripsi</h4>
                    <p className="text-muted-foreground">
                      {meeting.description}
                    </p>
                  </div>
                )}

                {meeting.agenda && meeting.agenda.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Agenda</h4>
                    <ul className="space-y-2">
                      {meeting.agenda.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary font-medium text-sm mt-0.5">
                            {index + 1}.
                          </span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Peserta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg"
                  >
                    <Avatar
                      src={participant.avatar_url || ""}
                      alt={participant.name}
                      name={participant.name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{participant.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {participant.role}
                      </p>
                      {participant.department && (
                        <p className="text-xs text-muted-foreground truncate">
                          {participant.department}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Kehadiran Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Fitur kehadiran akan segera tersedia
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus Meeting"
        description="Apakah Anda yakin ingin menghapus meeting ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
