import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { NavProvider } from "@/components/providers/NavProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavProvider>
      <div className="flex h-screen overflow-hidden bg-concrete">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area - Flex Grow */}
        <main className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#F8FAFC]">
          {/* Header - Static Height */}
          <div className="print:hidden z-10 relative">
            <Header />
          </div>

          {/* Page Content - Scrollable */}
          <div className="flex-1 overflow-auto p-4 md:p-8 relative print:p-0 print:overflow-visible">
            {children}
          </div>
        </main>
      </div>
    </NavProvider>
  );
}
