"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import { getUsers, addMeeting } from "../data";

export default function CreateMeetingPage() {
  const router = useRouter();
  const users = getUsers();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date_time: "",
    duration: 60,
    location: "",
    meeting_link: "",
    meeting_type: "onsite" as "onsite" | "virtual" | "hybrid",
    agenda: ["", ""],
    participants: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create meeting data
      const meetingData = {
        title: formData.title,
        description: formData.description,
        date_time: formData.date_time,
        duration: formData.duration,
        location: formData.location,
        meeting_link: formData.meeting_link,
        meeting_type: formData.meeting_type,
        agenda: formData.agenda.filter(item => item.trim() !== ''),
        status: 'scheduled' as const,
        created_by: '1', // Default to admin user for now
      };
      
      // Add meeting with participants
      const newMeeting = await addMeeting(meetingData, formData.participants);
      console.log("Meeting created:", newMeeting);
      
      if (newMeeting) {
        // Redirect to meetings page
        router.push("/meetings");
      } else {
        console.error("Failed to create meeting");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const addAgendaItem = () => {
    setFormData({ ...formData, agenda: [...formData.agenda, ""] });
  };

  const updateAgendaItem = (index: number, value: string) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index] = value;
    setFormData({ ...formData, agenda: newAgenda });
  };

  const removeAgendaItem = (index: number) => {
    const newAgenda = formData.agenda.filter((_, i) => i !== index);
    setFormData({ ...formData, agenda: newAgenda });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedUsers = users.filter((user) =>
    formData.participants.includes(user.id)
  );

  const toggleParticipant = (userId: string) => {
    if (formData.participants.includes(userId)) {
      setFormData({
        ...formData,
        participants: formData.participants.filter((id) => id !== userId),
      });
    } else {
      setFormData({
        ...formData,
        participants: [...formData.participants, userId],
      });
    }
  };

  const removeParticipant = (userId: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((id) => id !== userId),
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
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
          <h1 className="text-3xl font-bold">Buat Meeting Baru</h1>
          <p className="text-muted-foreground">
            Buat jadwal meeting baru untuk tim Anda
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Judul Meeting *"
            type="text"
            placeholder="Contoh: Rapat Evaluasi Produksi Mingguan"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />

          <Textarea
            label="Deskripsi"
            rows={3}
            placeholder="Jelaskan tujuan dan agenda utama meeting"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal & Waktu *"
              type="datetime-local"
              value={formData.date_time}
              onChange={(e) =>
                setFormData({ ...formData, date_time: e.target.value })
              }
              required
            />

            <Input
              label="Durasi (menit) *"
              type="number"
              min="15"
              max="480"
              step="15"
              value={formData.duration.toString()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: parseInt(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Lokasi *"
              type="text"
              placeholder="Contoh: Ruang Rapat Utama / Zoom Meeting"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />

            <Select
              label="Tipe Meeting *"
              value={formData.meeting_type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  meeting_type: value as "onsite" | "virtual" | "hybrid",
                })
              }
              options={[
                { value: "onsite", label: "Onsite" },
                { value: "virtual", label: "Virtual" },
                { value: "hybrid", label: "Hybrid" },
              ]}
            />
          </div>

          <Input
            label="Link Meeting"
            type="url"
            placeholder="https://zoom.us/j/123456789 atau link meeting lainnya"
            value={formData.meeting_link}
            onChange={(e) =>
              setFormData({ ...formData, meeting_link: e.target.value })
            }
            helperText="Opsional: Tambahkan link untuk meeting virtual atau hybrid"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Agenda</label>
            <div className="space-y-2">
              {formData.agenda.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={`Poin agenda ${index + 1}`}
                    value={item}
                    onChange={(e) => updateAgendaItem(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.agenda.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAgendaItem(index)}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="whiteLine"
                size="sm"
                onClick={addAgendaItem}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Agenda
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Peserta</label>

            {/* Selected Participants */}
            {selectedUsers.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-2">
                  Peserta Terpilih ({selectedUsers.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <Avatar
                        className="w-5 h-5"
                        src={user.avatar_url || ""}
                        alt={user.name}
                        name={user.name}
                        size="sm"
                      />
                      <span>{user.name}</span>
                      <Button
                        type="button"
                        onClick={() => removeParticipant(user.id)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Dropdown */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Cari peserta berdasarkan nama, role, atau departemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                icon={<Search className="w-4 h-4" />}
              />

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center p-3 hover:bg-muted cursor-pointer ${
                          formData.participants.includes(user.id)
                            ? "bg-primary/5"
                            : ""
                        }`}
                        onClick={() => toggleParticipant(user.id)}
                      >
                        <Avatar
                          className="w-8 h-8 mr-3"
                          src={user.avatar_url || ""}
                          alt={user.name}
                          name={user.name}
                          size="sm"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.role} • {user.department}
                          </div>
                        </div>
                        {formData.participants.includes(user.id) && (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted-foreground text-sm">
                      Tidak ada peserta yang ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Click outside to close dropdown */}
            {isDropdownOpen && (
              <div
                className="fixed inset-0 z-5"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Buat Meeting
            </Button>
            <Button
              type="button"
              variant="whiteLine"
              onClick={() => router.push("/meetings")}
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
