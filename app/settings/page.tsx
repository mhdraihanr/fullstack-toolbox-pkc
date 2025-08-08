"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Separator } from "@/components/ui/Separator";
import { Badge } from "@/components/ui/Badge";
import { User, Settings, Bell, Shield, Save, Camera } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/components/ui/Toast";

interface SettingsData {
  profile: {
    name: string;
    email: string;
    department: string;
    role: string;
    avatar_url?: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    taskReminders: boolean;
    meetingReminders: boolean;
    systemUpdates: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "team";
    showEmail: boolean;
    showDepartment: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: "12h" | "24h";
  };
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      name: "",
      email: "",
      department: "",
      role: "",
      avatar_url: "",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      meetingReminders: true,
      systemUpdates: false,
    },
    privacy: {
      profileVisibility: "team",
      showEmail: true,
      showDepartment: true,
    },
    preferences: {
      language: "id",
      timezone: "Asia/Jakarta",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
    },
  });

  // Sync settings with AuthProvider data
  useEffect(() => {
    if (user && profile) {
      const userName =
        profile?.name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "User";
      const userDepartment =
        profile?.department ||
        user?.user_metadata?.department ||
        "Unknown Department";
      const userRole = profile?.role || user?.user_metadata?.role || "employee";
      const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

      setSettings((prev) => ({
        ...prev,
        profile: {
          name: userName,
          email: user?.email || "",
          department: userDepartment,
          role: userRole,
          avatar_url: avatarUrl || "",
        },
      }));
    }
  }, [user, profile]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Settings saved:", settings);

      // Show success toast
      showToast("Pengaturan berhasil disimpan!", "success");

      // Here you would typically make an API call to save the settings
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Gagal menyimpan pengaturan. Silakan coba lagi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar yang valid");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Upload to server using new settings API
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/settings", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Refresh profile data in AuthProvider to update header and local state
      await refreshProfile();

      console.log("Photo uploaded successfully");
      showToast("Foto profil berhasil diperbarui!", "success");
    } catch (error) {
      console.error("Error uploading photo:", error);
      showToast("Gagal mengupload foto. Silakan coba lagi.", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const updateSettings = <
    S extends keyof SettingsData,
    F extends keyof SettingsData[S]
  >(
    section: S,
    field: F,
    value: SettingsData[S][F]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "notifications", label: "Notifikasi", icon: Bell },
    { id: "privacy", label: "Privasi", icon: Shield },
    { id: "preferences", label: "Preferensi", icon: Settings },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {settings.profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.profile.avatar_url}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              size="sm"
              className="rounded-full w-8 h-8 p-0"
              onClick={() => document.getElementById("avatar-upload")?.click()}
              disabled={isUploadingPhoto}
              title="Ubah foto profil"
            >
              {isUploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{settings.profile.name}</h3>
          <p className="text-sm text-muted-foreground">
            {settings.profile.email}
          </p>
          <Badge variant="secondary" className="mt-1">
            {settings.profile.role}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Hanya foto profil yang dapat diubah. Klik ikon kamera untuk
            mengganti foto.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            value={settings.profile.name}
            placeholder="Nama lengkap"
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Nama tidak dapat diubah. Hubungi administrator untuk perubahan.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={settings.profile.email}
            placeholder="Email"
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email tidak dapat diubah.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Departemen</Label>
          <Input
            id="department"
            value={settings.profile.department}
            placeholder="Departemen"
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Departemen tidak dapat diubah. Hubungi administrator untuk
            perubahan.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={settings.profile.role}
            placeholder="Role"
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Role tidak dapat diubah.
          </p>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pengaturan Notifikasi</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Terima notifikasi melalui email
              </p>
            </div>
            <Switch
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(checked) =>
                updateSettings("notifications", "emailNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Terima notifikasi push di browser
              </p>
            </div>
            <Switch
              checked={settings.notifications.pushNotifications}
              onCheckedChange={(checked) =>
                updateSettings("notifications", "pushNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Pengingat untuk tugas yang akan deadline
              </p>
            </div>
            <Switch
              checked={settings.notifications.taskReminders}
              onCheckedChange={(checked) =>
                updateSettings("notifications", "taskReminders", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Meeting Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Pengingat untuk rapat yang akan dimulai
              </p>
            </div>
            <Switch
              checked={settings.notifications.meetingReminders}
              onCheckedChange={(checked) =>
                updateSettings("notifications", "meetingReminders", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifikasi untuk update sistem
              </p>
            </div>
            <Switch
              checked={settings.notifications.systemUpdates}
              onCheckedChange={(checked) =>
                updateSettings("notifications", "systemUpdates", checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pengaturan Privasi</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Visibilitas Profil</Label>
            <select
              aria-label="Visibilitas Profil"
              value={settings.privacy.profileVisibility}
              onChange={(e) =>
                updateSettings(
                  "privacy",
                  "profileVisibility",
                  e.target.value as "public" | "private" | "team"
                )
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="public">Publik - Semua orang dapat melihat</option>
              <option value="team">
                Tim - Hanya anggota tim yang dapat melihat
              </option>
              <option value="private">
                Privat - Hanya Anda yang dapat melihat
              </option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tampilkan Email</Label>
              <p className="text-sm text-muted-foreground">
                Email akan terlihat di profil publik
              </p>
            </div>
            <Switch
              checked={settings.privacy.showEmail}
              onCheckedChange={(checked) =>
                updateSettings("privacy", "showEmail", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tampilkan Departemen</Label>
              <p className="text-sm text-muted-foreground">
                Departemen akan terlihat di profil publik
              </p>
            </div>
            <Switch
              checked={settings.privacy.showDepartment}
              onCheckedChange={(checked) =>
                updateSettings("privacy", "showDepartment", checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preferensi Aplikasi</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Bahasa</Label>
            <select
              aria-label="Bahasa"
              value={settings.preferences.language}
              onChange={(e) =>
                updateSettings("preferences", "language", e.target.value)
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Zona Waktu</Label>
            <select
              aria-label="Zona Waktu"
              value={settings.preferences.timezone}
              onChange={(e) =>
                updateSettings("preferences", "timezone", e.target.value)
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
              <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
              <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Format Tanggal</Label>
            <select
              aria-label="Format Tanggal"
              value={settings.preferences.dateFormat}
              onChange={(e) =>
                updateSettings("preferences", "dateFormat", e.target.value)
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Format Waktu</Label>
            <select
              aria-label="Format Waktu"
              value={settings.preferences.timeFormat}
              onChange={(e) =>
                updateSettings(
                  "preferences",
                  "timeFormat",
                  e.target.value as "12h" | "24h"
                )
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="24h">24 Jam (14:30)</option>
              <option value="12h">12 Jam (2:30 PM)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tema</Label>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">
              Pilih tema terang atau gelap
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileTab();
      case "notifications":
        return renderNotificationsTab();
      case "privacy":
        return renderPrivacyTab();
      case "preferences":
        return renderPreferencesTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground mt-2">
            Kelola profil, notifikasi, dan preferensi aplikasi Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {(() => {
                    const activeTabData = tabs.find(
                      (tab) => tab.id === activeTab
                    );
                    const Icon = activeTabData?.icon || Settings;
                    return (
                      <>
                        <Icon className="w-5 h-5" />
                        <span>{activeTabData?.label}</span>
                      </>
                    );
                  })()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderTabContent()}

                <Separator />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
