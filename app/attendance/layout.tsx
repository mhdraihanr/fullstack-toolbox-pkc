import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance | Web Toolbox PKC",
  description: "Kelola dan dokumentasikan kehadiran dengan mudah",
};

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}