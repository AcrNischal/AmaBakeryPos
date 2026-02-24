import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { branches, User } from "@/lib/mockData";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get current user and branch
  const storedUser = localStorage.getItem('currentUser');
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;
  const branch = branches.find(b => b.id === user?.branchId);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 hidden md:block">
        <AdminSidebar />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between p-4 pr-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-1">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-1">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-primary/20 bg-white">
              <img src="/logos/logo2brown.jpeg" alt="Ama Bakery" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-sm leading-none">{branch?.name || "Ama Bakery"}</h1>
              <span className="text-[10px] text-muted-foreground font-medium">Branch Admin</span>
            </div>
          </div>
        </div>
      </div>

      <main className="md:ml-64 min-h-screen transition-all duration-200 ease-in-out">
        <Outlet />
      </main>
    </div>
  );
}
