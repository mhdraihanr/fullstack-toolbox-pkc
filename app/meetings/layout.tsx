import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meetings | Web Toolbox PKC",
  description: "Kelola dan dokumentasikan pertemuan dengan mudah",
};

export default function MeetingsLayout({
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
