import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Bell,
  User as UserIcon,
  LogOut,
  Settings,
  HelpCircle
} from "lucide-react";
import { logout, getCurrentUser } from "@/auth/auth";

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  notificationCount?: number;
}

export function MobileHeader({ title, showBack = false, showNotification = true, notificationCount = 0 }: MobileHeaderProps) {
  const navigate = useNavigate();

  // Get current user and branch
  const user = getCurrentUser();
  const userName = user?.username || "Staff";
  const userRole = user?.role || "Staff";
  const branchName = user?.branch_name || "Ama Bakery";

  return (
    <header className="sticky top-0 z-50 glass-panel border-b px-4 pr-14 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white p-1.5 shadow-md border-2 border-primary/20 shrink-0 overflow-hidden flex items-center justify-center">
              <img src="/logos/logo1white.jfif" alt="AMA BAKERY" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-base lg:text-lg font-rockwell font-black text-slate-800 tracking-tight leading-none">AMA BAKERY</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showNotification && (
            <Button variant="ghost" size="icon" className="relative h-10 w-10 text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black">
                  {notificationCount}
                </span>
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-xl border-none p-2 animate-in fade-in zoom-in-95 duration-200">
              <DropdownMenuLabel className="p-3">
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">{userRole} Account</span>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground">{userName}</span>
                  <span className="text-[10px] text-slate-400 font-bold italic">{branchName}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors active:scale-95">
                <Settings className="h-4 w-4 text-slate-500" />
                <span className="font-semibold">Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors active:scale-95">
                <HelpCircle className="h-4 w-4 text-slate-500" />
                <span className="font-semibold">Help Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
