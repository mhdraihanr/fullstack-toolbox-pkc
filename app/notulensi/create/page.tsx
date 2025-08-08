"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Meeting, User as UserType, NotulensiFormData } from "../../../types";
import { useNotulensi } from "../../../lib/hooks/useNotulensi";
import { useMeetings } from "../../../lib/hooks/useMeetings";
import { useUsers } from "../../../lib/hooks/useUsers";
import { formatRelativeTime } from "../../../lib/utils";

interface ActionItemForm {
  description: string;
  assignee_id?: string;
  due_date?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
}

export default function CreateNotulensiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");
  const [meetings, setMeetings] = useState<
    (Meeting & { creator?: UserType })[]
  >([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(!!draftId);

  const [formData, setFormData] = useState<
    NotulensiFormData & { meeting_id: string }
  >({
    meeting_id: "",
    content: "",
    decisions: [""],
    next_meeting_date: "",
    action_items: [],
  });

  const [actionItemForm, setActionItemForm] = useState<ActionItemForm>({
    description: "",
    assignee_id: "",
    due_date: "",
    priority: "medium",
    status: "pending",
  });

  // API hooks
  const {
    meetings: meetingsData,
    loading: meetingsLoading,
    error: meetingsError,
  } = useMeetings({ status: "completed" });
  const { users: usersData, loading: usersLoading } = useUsers();
  const {
    createNotulensi,
    updateNotulensi,
    notulensi: allNotulensi,
    loading: notulensiLoading,
  } = useNotulensi();

  useEffect(() => {
    if (meetingsData && Array.isArray(meetingsData)) {
      setMeetings(
        meetingsData.map((meeting) => ({
          ...meeting,
          creator: usersData?.find((user) => user.id === meeting.created_by),
        }))
      );
    }
  }, [meetingsData, usersData]);

  useEffect(() => {
    if (usersData && Array.isArray(usersData)) {
      setUsers(usersData);
    }
  }, [usersData]);

  useEffect(() => {
    // Load draft data if editing
    if (draftId && allNotulensi && Array.isArray(allNotulensi)) {
      const draft = allNotulensi.find((n) => n.id === draftId && n.is_draft);
      if (draft) {
        setFormData({
          meeting_id: draft.meeting_id,
          content: draft.content,
          decisions: draft.decisions.length > 0 ? draft.decisions : [""],
          next_meeting_date: draft.next_meeting_date || "",
          action_items:
            draft.action_items?.map((item) => ({
              description: item.description,
              assignee_id: item.assignee_id,
              due_date: item.due_date,
              priority: item.priority,
              status: item.status,
            })) || [],
        });
      }
    }
  }, [draftId, allNotulensi]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDecisionChange = (index: number, value: string) => {
    const newDecisions = [...formData.decisions];
    newDecisions[index] = value;
    setFormData((prev) => ({
      ...prev,
      decisions: newDecisions,
    }));
  };

  const addDecision = () => {
    setFormData((prev) => ({
      ...prev,
      decisions: [...prev.decisions, ""],
    }));
  };

  const removeDecision = (index: number) => {
    if (formData.decisions.length > 1) {
      const newDecisions = formData.decisions.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        decisions: newDecisions,
      }));
    }
  };

  const handleActionItemChange = (
    field: keyof ActionItemForm,
    value: string
  ) => {
    setActionItemForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addActionItem = () => {
    if (actionItemForm.description.trim()) {
      const newActionItem = {
        description: actionItemForm.description,
        assignee_id: actionItemForm.assignee_id || undefined,
        due_date: actionItemForm.due_date || undefined,
        priority: actionItemForm.priority,
        status: actionItemForm.status,
      };

      setFormData((prev) => ({
        ...prev,
        action_items: [...prev.action_items, newActionItem],
      }));

      // Reset form
      setActionItemForm({
        description: "",
        assignee_id: "",
        due_date: "",
        priority: "medium",
        status: "pending",
      });
    }
  };

  const removeActionItem = (index: number) => {
    const newActionItems = formData.action_items.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      action_items: newActionItems,
    }));
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const draftData = {
        meeting_id: formData.meeting_id,
        content: formData.content,
        decisions: formData.decisions.filter((d) => d.trim()),
        next_meeting_date: formData.next_meeting_date,
        action_items: formData.action_items,
        is_draft: true,
      };

      if (draftId) {
        // Update existing draft
        await updateNotulensi(draftId, draftData);
        alert("Draft berhasil diperbarui!");
      } else {
        // Create new draft
        await createNotulensi(draftData);
        alert("Draft berhasil disimpan!");
      }

      // Redirect to draft list
      router.push("/notulensi/draft");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Gagal menyimpan draft. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const notulensiData = {
        meeting_id: formData.meeting_id,
        content: formData.content,
        decisions: formData.decisions.filter((d) => d.trim()),
        next_meeting_date: formData.next_meeting_date,
        action_items: formData.action_items,
        is_draft: false,
      };

      if (isDraftMode && draftId) {
        // Publish existing draft
        await updateNotulensi(draftId, notulensiData);
        alert("Notulensi berhasil dipublikasikan!");
      } else {
        // Create new notulensi
        await createNotulensi(notulensiData);
        alert("Notulensi berhasil dibuat!");
      }

      // Redirect to notulensi list
      router.push("/notulensi");
    } catch (error) {
      console.error("Error creating notulensi:", error);
      alert("Gagal membuat notulensi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMeeting = meetings.find((m) => m.id === formData.meeting_id);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/notulensi">
          <Button variant="whiteLine" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Buat Notulensi Baru
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Dokumentasikan hasil rapat dan Tindak Lanjut
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meeting Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Pilih Rapat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rapat *
              </label>
              <select
                aria-label="Pilih rapat"
                value={formData.meeting_id}
                onChange={(e) =>
                  handleInputChange("meeting_id", e.target.value)
                }
                required
                disabled={meetingsLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {meetingsLoading ? "Memuat rapat..." : "Pilih rapat..."}
                </option>
                {!meetingsLoading &&
                  meetings.map((meeting) => (
                    <option key={meeting.id} value={meeting.id}>
                      {meeting.title} - {formatDate(meeting.date_time)}
                    </option>
                  ))}
              </select>
              {meetingsError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Error: {meetingsError}
                </p>
              )}
              {!meetingsLoading && !meetingsError && meetings.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  Tidak ada rapat yang sudah selesai. Pastikan ada rapat dengan
                  status &quot;completed&quot;.
                </p>
              )}
            </div>

            {selectedMeeting && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedMeeting.title}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(selectedMeeting.date_time)} (
                    {selectedMeeting.duration} menit)
                  </div>
                  {selectedMeeting.creator && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Dibuat oleh: {selectedMeeting.creator.name}
                    </div>
                  )}
                  {selectedMeeting.description && (
                    <p className="mt-2">{selectedMeeting.description}</p>
                  )}
                </div>
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
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Konten Notulensi *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                required
                rows={12}
                placeholder="Tulis isi notulensi rapat di sini...\n\nContoh:\n# Notulensi Rapat [Judul]\n\n## Peserta Rapat\n- Nama 1 (Jabatan)\n- Nama 2 (Jabatan)\n\n## Pembahasan\n### 1. Topik Pertama\n- Point pembahasan\n- Kesimpulan\n\n### 2. Topik Kedua\n- Point pembahasan\n- Kesimpulan"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Keputusan Rapat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.decisions.map((decision, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={decision}
                    onChange={(e) =>
                      handleDecisionChange(index, e.target.value)
                    }
                    placeholder={`Keputusan ${index + 1}`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                {formData.decisions.length > 1 && (
                  <Button
                    type="button"
                    variant="whiteLine"
                    size="sm"
                    onClick={() => removeDecision(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="whiteLine"
              onClick={addDecision}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Keputusan
            </Button>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Tindak Lanjut
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Action Item Form */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Tambah Action Item
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    value={actionItemForm.description}
                    onChange={(e) =>
                      handleActionItemChange("description", e.target.value)
                    }
                    placeholder="Deskripsi action item"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assignee
                  </label>
                  <select
                    aria-label="Pilih assignee"
                    value={actionItemForm.assignee_id}
                    onChange={(e) =>
                      handleActionItemChange("assignee_id", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Pilih assignee...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={actionItemForm.due_date}
                    onChange={(e) =>
                      handleActionItemChange("due_date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioritas
                  </label>
                  <select
                    aria-label="Pilih prioritas"
                    value={actionItemForm.priority}
                    onChange={(e) =>
                      handleActionItemChange(
                        "priority",
                        e.target.value as "low" | "medium" | "high"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    aria-label="Pilih status"
                    value={actionItemForm.status}
                    onChange={(e) =>
                      handleActionItemChange(
                        "status",
                        e.target.value as "pending" | "completed"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <Button
                type="button"
                onClick={addActionItem}
                disabled={!actionItemForm.description.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Action Item
              </Button>
            </div>

            {/* Action Items List */}
            {formData.action_items.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Tindak Lanjut ({formData.action_items.length})
                </h4>
                {formData.action_items.map((item, index) => {
                  const assignee = users.find((u) => u.id === item.assignee_id);
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {assignee && <span>Assignee: {assignee.name}</span>}
                            {item.due_date && (
                              <span>
                                Due:{" "}
                                {new Date(item.due_date).toLocaleDateString(
                                  "id-ID"
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority === "high"
                              ? "Tinggi"
                              : item.priority === "medium"
                              ? "Sedang"
                              : "Rendah"}
                          </Badge>
                          <Badge
                            status={item.status}
                            className={
                              item.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            }
                          >
                            {item.status === "completed"
                              ? "Completed"
                              : "Pending"}
                          </Badge>
                          <Button
                            type="button"
                            variant="whiteLine"
                            size="sm"
                            onClick={() => removeActionItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Meeting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Rapat Selanjutnya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Rapat Selanjutnya (Opsional)
              </label>
              <input
                type="datetime-local"
                value={formData.next_meeting_date}
                onChange={(e) =>
                  handleInputChange("next_meeting_date", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href={isDraftMode ? "/notulensi/draft" : "/notulensi"}>
            <Button type="button" variant="whiteLine">
              Batal
            </Button>
          </Link>

          {/* Save as Draft Button */}
          <Button
            type="button"
            variant="whiteLine"
            onClick={handleSaveDraft}
            disabled={isLoading || !formData.meeting_id}
          >
            {isLoading ? (
              "Menyimpan..."
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Simpan sebagai Draft
              </>
            )}
          </Button>

          {/* Publish Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.meeting_id || !formData.content}
          >
            {isLoading ? (
              "Menyimpan..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isDraftMode ? "Publikasikan Notulensi" : "Simpan Notulensi"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
