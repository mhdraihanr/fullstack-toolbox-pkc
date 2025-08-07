import { ReactNode } from "react";

export default function MeetingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
