"use client";

import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import { UserProfile, UserBadge } from "@/components/auth/UserProfile";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";
import { Shield, Users, Lock, Mail, Key, ArrowRight } from "lucide-react";

function DemoContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Authentication System Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistem authentication lengkap untuk Web Toolbox PKC menggunakan
            Supabase
          </p>
        </div>

        {user ? (
          /* Authenticated State */
          <div className="space-y-8">
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Selamat Datang!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Informasi User
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Nama:</strong>{" "}
                      {profile?.name || user.user_metadata?.name || "Tidak diset"}
                    </p>
                    <p>
                      <strong>Departemen:</strong>{" "}
                      {profile?.department || user.user_metadata?.department || "Tidak diset"}
                    </p>
                    <p>
                      <strong>Role:</strong>{" "}
                      {profile?.role || user.user_metadata?.role || "employee"}
                    </p>
                    <p>
                      <strong>User ID:</strong> {user.id}
                    </p>
                    {profile && (
                      <p>
                        <strong>Profile Created:</strong>{" "}
                        {new Date(profile.created_at).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Status
                  </h3>
                  <UserBadge />
                </div>
              </div>
            </div>

            {/* User Profile Components Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Komponen User Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Full Variant
                  </h3>
                  <div className="border rounded-lg p-4">
                    <UserProfile variant="full" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Compact Variant
                  </h3>
                  <div className="border rounded-lg p-4">
                    <UserProfile variant="compact" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Avatar Only
                  </h3>
                  <div className="border rounded-lg p-4">
                    <UserProfile variant="avatar-only" />
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Buttons Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Komponen Logout
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Default Button
                  </h3>
                  <LogoutButton variant="default" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ghost Button
                  </h3>
                  <LogoutButton variant="ghost" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Outline Button
                  </h3>
                  <LogoutButton variant="outline" />
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Navigasi Aplikasi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Dashboard</h3>
                    <p className="text-sm text-gray-600">
                      Halaman utama aplikasi
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  href="/tasks"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Tasks</h3>
                    <p className="text-sm text-gray-600">Manajemen tugas</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  href="/meetings"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Meetings</h3>
                    <p className="text-sm text-gray-600">Manajemen meeting</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Unauthenticated State */
          <div className="space-y-8">
            {/* Features Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Fitur Authentication
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-3">
                    <Lock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Secure Login</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Login aman dengan Supabase Auth
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    User Registration
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Pendaftaran user dengan profil lengkap
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100 mb-3">
                    <Mail className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Email Verification
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Verifikasi email otomatis
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-3">
                    <Key className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Password Reset
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Reset password via email
                  </p>
                </div>
              </div>
            </div>

            {/* Auth Pages */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Halaman Authentication
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/auth/login"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Login</h3>
                    <p className="text-sm text-gray-600">Masuk ke aplikasi</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Register</h3>
                    <p className="text-sm text-gray-600">Daftar akun baru</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  href="/auth/forgot-password"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Forgot Password
                    </h3>
                    <p className="text-sm text-gray-600">Reset password</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
                <div className="flex items-center p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-500">
                      Reset Password
                    </h3>
                    <p className="text-sm text-gray-400">
                      Hanya via email link
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Mulai Menggunakan
              </h2>
              <p className="text-blue-800 mb-4">
                Untuk melihat demo lengkap, silakan login atau daftar akun baru
                terlebih dahulu.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Daftar
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthDemoPage() {
  return (
    <AuthProvider>
      <DemoContent />
    </AuthProvider>
  );
}
