"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Lock, Plus, Pencil, Trash2, Shield, CheckCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

interface Permission {
  id: string; name: string; slug: string; category: string; description: string;
}

const mockPermissions: Permission[] = [
  { id: "1", name: "User Read", slug: "user:read", category: "User", description: "View user profiles" },
  { id: "2", name: "User Create", slug: "user:create", category: "User", description: "Create new users" },
  { id: "3", name: "User Update", slug: "user:update", category: "User", description: "Edit user details" },
  { id: "4", name: "User Delete", slug: "user:delete", category: "User", description: "Delete users" },
  { id: "5", name: "Tour Read", slug: "tour:read", category: "Tour", description: "View tours" },
  { id: "6", name: "Tour Create", slug: "tour:create", category: "Tour", description: "Create tours" },
  { id: "7", name: "Booking Read", slug: "booking:read", category: "Booking", description: "View bookings" },
  { id: "8", name: "Booking Update", slug: "booking:update", category: "Booking", description: "Update bookings" },
  { id: "9", name: "API Manage", slug: "api:manage", category: "System", description: "Manage API keys" },
  { id: "10", name: "System Config", slug: "system:config", category: "System", description: "System configuration" },
];

const columns: DataTableColumn<Permission>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "slug", title: "Slug", sortable: true, render: (p) => <code className="rounded bg-muted px-1 py-0.5 text-sm">{p.slug}</code> },
  { key: "category", title: "Category", sortable: true },
  { key: "description", title: "Description" },
];

export default function PermissionsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setPermissions(permissions.filter((p) => !ids.includes(p.id)));

  return (
    <div className="space-y-6">
      <PageHeader title="Permission Management" description="Manage system permissions" action={<Button><Plus className="mr-2 h-4 w-4" />Add Permission</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Permissions" value={permissions.length} icon={Lock} />
        <StatCard title="User" value={permissions.filter((p) => p.category === "User").length} icon={Shield} />
        <StatCard title="Tour" value={permissions.filter((p) => p.category === "Tour").length} icon={CheckCircle} />
        <StatCard title="System" value={permissions.filter((p) => p.category === "System").length} icon={Lock} />
      </div>
      <DataTable data={permissions} columns={columns} keyExtractor={(p) => p.id} searchKeys={["name", "slug", "category"]}
        actions={[{ label: "Edit", icon: Pencil, onClick: (p) => console.log("Edit", p) }, { label: "Delete", icon: Trash2, onClick: (p) => handleDelete([p.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
