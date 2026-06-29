"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Shield, Plus, Pencil, Trash2, Eye, Users } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

interface Role {
  id: string; name: string; slug: string; level: number; users: number; permissions: number; description: string;
}

const mockRoles: Role[] = [
  { id: "1", name: "Super Admin", slug: "super_admin", level: 100, users: 2, permissions: 60, description: "Full system access" },
  { id: "2", name: "Admin", slug: "admin", level: 80, users: 5, permissions: 45, description: "Admin panel access" },
  { id: "3", name: "Moderator", slug: "moderator", level: 60, users: 8, permissions: 25, description: "Content moderation" },
  { id: "4", name: "Guide", slug: "guide", level: 40, users: 34, permissions: 15, description: "Guide dashboard" },
  { id: "5", name: "Customer", slug: "customer", level: 20, users: 892, permissions: 10, description: "Customer access" },
  { id: "6", name: "Guest", slug: "guest", level: 10, users: 0, permissions: 5, description: "Public access" },
];

const columns: DataTableColumn<Role>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "slug", title: "Slug", sortable: true, render: (r) => <code className="rounded bg-muted px-1 py-0.5 text-sm">{r.slug}</code> },
  { key: "level", title: "Level", sortable: true },
  { key: "users", title: "Users", sortable: true },
  { key: "permissions", title: "Permissions", sortable: true },
  { key: "description", title: "Description" },
];

export default function RolesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [roles, setRoles] = useState<Role[]>(mockRoles);

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setRoles(roles.filter((r) => !ids.includes(r.id)));

  return (
    <div className="space-y-6">
      <PageHeader title="Role Management" description="Manage user roles" action={<Button><Plus className="mr-2 h-4 w-4" />Add Role</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Roles" value={roles.length} icon={Shield} />
        <StatCard title="Super Admin" value={roles.find((r) => r.slug === "super_admin")?.users || 0} icon={Eye} />
        <StatCard title="Admin" value={roles.find((r) => r.slug === "admin")?.users || 0} icon={Shield} />
        <StatCard title="Total Users" value={roles.reduce((a, r) => a + r.users, 0)} icon={Users} />
      </div>
      <DataTable data={roles} columns={columns} keyExtractor={(r) => r.id} searchKeys={["name", "slug", "description"]}
        actions={[{ label: "Edit", icon: Pencil, onClick: (r) => console.log("Edit", r) }, { label: "Delete", icon: Trash2, onClick: (r) => handleDelete([r.id]), variant: "destructive", condition: (r) => r.slug !== "super_admin" }]}
        bulkActions={[{ label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
