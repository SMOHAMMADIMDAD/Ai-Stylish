"use client";

import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8fb] via-[#faf8ff] to-[#f8f5ff]">

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <main className="min-h-screen lg:ml-64">
        {children}
      </main>

    </div>
  );
}