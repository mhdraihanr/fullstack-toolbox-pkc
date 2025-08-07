import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notulensi Rapat | Web Toolbox PKC",
  description: "Kelola dan dokumentasikan notulensi rapat dengan mudah",
};

export default function NotulensiLayout({
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