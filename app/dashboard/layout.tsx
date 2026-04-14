import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-concrete">
      {/* Sidebar - Static Width */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main Content Area - Flex Grow */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
        {/* Header - Static Height */}
        <div className="print:hidden">
          <Header />
        </div>

        {/* Page Content - Scrollable */}
        <div className="flex-1 overflow-auto p-8 relative print:p-0 print:overflow-visible">
          {children}
        </div>
      </main>
    </div>
  );
}
