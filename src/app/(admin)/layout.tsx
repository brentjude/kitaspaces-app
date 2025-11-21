// Purpose: Layout wrapper for admin dashboard pages
// Features: Sidebar navigation, responsive design, authentication check
import AdminSidebar from "@/app/(admin)/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}