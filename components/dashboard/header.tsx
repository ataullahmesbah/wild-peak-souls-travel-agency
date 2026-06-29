"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Shield,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getDashboardPathForRole } from "@/config/dashboard";
import { Logo } from "@/components/layout/logo";

interface DashboardHeaderProps {
  role: string;
  user: any;
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "New Booking",
    message: "John Doe booked a tour to Annapurna Base Camp",
    time: "5 min ago",
    read: false,
    type: "success",
  },
  {
    id: "2",
    title: "Review Pending",
    message: "3 new reviews need moderation",
    time: "1 hour ago",
    read: false,
    type: "warning",
  },
  {
    id: "3",
    title: "System Update",
    message: "Dashboard v2.0 is now available",
    time: "2 hours ago",
    read: true,
    type: "info",
  },
];

export function DashboardHeader({
  role,
  user,
  onMenuClick,
  sidebarCollapsed,
  setSidebarCollapsed,
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-destructive text-destructive-foreground";
      case "admin":
        return "bg-primary text-primary-foreground";
      case "moderator":
        return "bg-warning text-warning-foreground";
      case "guide":
        return "bg-ocean-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleLabel = (role: string) => {
    return role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <Link
            href={getDashboardPathForRole(role)}
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          {pathname
            ?.split("/")
            .filter(Boolean)
            .slice(1)
            .map((segment, index, arr) => {
              const href = "/" + arr.slice(0, index + 1).join("/");
              const isLast = index === arr.length - 1;
              return (
                <span key={segment} className="flex items-center gap-1">
                  <span className="text-muted-foreground">/</span>
                  {isLast ? (
                    <span className="font-medium text-foreground capitalize">
                      {segment.replace(/-/g, " ")}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className="hover:text-foreground transition-colors capitalize"
                    >
                      {segment.replace(/-/g, " ")}
                    </Link>
                  )}
                </span>
              );
            })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 pl-9 bg-background"
            />
          </div>
        </div>

        {/* Mobile Search */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      notification.read
                        ? "border-border bg-card"
                        : "border-primary/20 bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 h-2 w-2 rounded-full",
                          notification.type === "success" && "bg-green-500",
                          notification.type === "warning" && "bg-yellow-500",
                          notification.type === "error" && "bg-red-500",
                          notification.type === "info" && "bg-blue-500"
                        )}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback>
                  {getInitials(user?.name || "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || ""}
                </p>
                <span
                  className={cn(
                    "mt-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    getRoleColor(role)
                  )}
                >
                  {getRoleLabel(role)}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            {role === "admin" || role === "super_admin" ? (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/settings">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Settings
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
