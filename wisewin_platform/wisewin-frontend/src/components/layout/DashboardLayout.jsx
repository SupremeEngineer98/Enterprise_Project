// Main layout for all dashboard pages: sidebar on the left, topbar at the top, page content in the middle
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ sidebarItems, title, children }) {
  return (
    <div className="flex min-h-screen bg-[#fcf8ff]">
      <aside className="w-64 hidden lg:block">
        <Sidebar items={sidebarItems} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 p-10 space-y-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
