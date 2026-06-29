"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNavSectionsForRole,
  type DashboardNavItem,
  type DashboardNavSection,
} from "@/config/dashboard";
import { Logo } from "@/components/layout/logo";

interface DashboardSidebarProps {
  role: string;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

function SidebarItem({
  item,
  depth = 0,
  collapsed,
  role,
}: {
  item: DashboardNavItem;
  depth?: number;
  collapsed: boolean;
  role: string;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  if (collapsed && depth === 0 && !hasChildren) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center justify-center rounded-lg p-2 transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        title={item.title}
      >
        <Icon className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <div className={cn("", depth > 0 && "ml-4 border-l border-border pl-2")}>
      {hasChildren ? (
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {!collapsed && (
            <>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                  {item.badge}
                </span>
              )}
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </>
          )}
        </button>
      ) : (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {!collapsed && (
            <>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>
      )}
      {!collapsed && hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <SidebarItem
              key={child.href}
              item={child}
              depth={depth + 1}
              collapsed={collapsed}
              role={role}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardSidebar({
  role,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: DashboardSidebarProps) {
  const sections = getNavSectionsForRole(role);

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transform bg-card shadow-lg transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <Logo />
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <SidebarContent sections={sections} role={role} collapsed={false} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-card transition-all duration-300 lg:flex",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center border-b border-border px-4 py-3">
            {!collapsed ? (
              <Logo />
            ) : (
              <div className="flex w-full justify-center">
                <Logo compact />
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <SidebarContent sections={sections} role={role} collapsed={collapsed} />
          </div>
          <div className="border-t border-border p-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? "Expand" : "Collapse"}
            >
              <svg
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarContent({
  sections,
  role,
  collapsed,
}: {
  sections: DashboardNavSection[];
  role: string;
  collapsed: boolean;
}) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.title}>
          {!collapsed && (
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
          )}
          <div className="space-y-1">
            {section.items.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                collapsed={collapsed}
                role={role}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
