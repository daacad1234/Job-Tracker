import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
