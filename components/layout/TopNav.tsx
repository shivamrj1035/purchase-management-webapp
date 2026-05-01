"use client";

import { Menu, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TopNavProps {
  onMenuClick?: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const displayName = user?.firstName || user?.username || "User";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const initials = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="sticky top-0 z-40 h-14 md:h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-400 hover:text-white flex-shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-sm md:text-lg font-semibold text-white truncate">
            Welcome back, {displayName}
          </h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            Manage your home buying journey
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-400 hover:text-white"
          onClick={() => router.push("/dashboard/notifications")}
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-auto py-1 px-2 md:px-3"
            >
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                {user?.imageUrl && (
                  <AvatarImage src={user.imageUrl} alt={displayName} />
                )}
                <AvatarFallback className="bg-blue-500 text-white text-xs md:text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-white text-sm">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 md:w-56 bg-slate-900 border-slate-800"
          >
            <DropdownMenuLabel className="text-white">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
