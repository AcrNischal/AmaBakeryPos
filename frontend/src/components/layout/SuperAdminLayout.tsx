import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function SuperAdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 hidden md:block border-r bg-white">
                <SuperAdminSidebar />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-30 flex items-center justify-between p-4 pr-14 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="flex items-center gap-3">
                    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64 border-r-0">
                            <SuperAdminSidebar onNavigate={() => setSidebarOpen(false)} />
                        </SheetContent>
                    </Sheet>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg overflow-hidden border border-primary/20 bg-white">
                            <img src="/logos/logo2brown.jpeg" alt="Ama Bakery" className="h-full w-full object-cover" />
                        </div>
                        <h1 className="font-bold text-base">Ama HQ</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-6 lg:p-8 space-y-6 text-slate-900">
                <Outlet />
            </main>
        </div>
    );
}
