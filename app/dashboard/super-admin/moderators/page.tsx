"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Eye, Plus, Pencil, Trash2, Shield, Users } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

interface Moderator {
  id: string; name: string; email: string; status: string; lastLogin: string; createdAt: string;
}

const mockModerators: Moderator[] = [
  { id: "1", name: "David Brown", email: "david@example.com", status: "active", lastLogin: "2024-12-18", createdAt: "2024-04-12" },
  { id: "2", name: "Lisa Chen", email: "lisa@example.com", status: "active", lastLogin: "2024-12-19", createdAt: "2024-06-20" },
  { id: "3", name: "Tom Wilson", email: "tom@example.com", status: "inactive", lastLogin: "2024-11-15", createdAt: "2024-07-10" },
  { id: "4", name: "Anna Garcia", email: "anna@example.com", status: "active", lastLogin: "2024-12-20", createdAt: "2024-08-05" },
];

const columns: DataTableColumn<Moderator>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "email", title: "Email", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (m) => (
    <Badge variant={m.status === "active" ? "default" : "secondary"} className={m.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>{m.status}</Badge>
  )},
  { key: "lastLogin", title: "Last Login", sortable: true },
  { key: "createdAt", title: "Created", sortable: true },
];

export default function ModeratorsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [moderators, setModerators] = useState<Moderator[]>(mockModerators);

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setModerators(moderators.filter((m) => !ids.includes(m.id)));
  const handleStatus = (ids: string[], status: string) => setModerators(moderators.map((m) => ids.includes(m.id) ? { ...m, status } : m));

  return (
    <div className="space-y-6">
      <PageHeader title="Moderator Management" description="Manage moderator users" action={<Button><Plus className="mr-2 h-4 w-4" />Add Moderator</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Moderators" value={moderators.length} icon={Users} />
        <StatCard title="Active" value={moderators.filter((m) => m.status === "active").length} icon={Eye} />
        <StatCard title="Inactive" value={moderators.filter((m) => m.status === "inactive").length} icon={Shield} />
        <StatCard title="New This Month" value={1} icon={Users} />
      </div>
      <DataTable data={moderators} columns={columns} keyExtractor={(m) => m.id} searchKeys={["name", "email", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (m) => console.log("Edit", m) }, { label: "Delete", icon: Trash2, onClick: (m) => handleDelete([m.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Activate", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
