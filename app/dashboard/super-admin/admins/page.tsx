"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { UserCheck, Plus, Pencil, Trash2, Eye, Shield } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

interface Admin {
  id: string; name: string; email: string; role: string; status: string; lastLogin: string; createdAt: string;
}

const mockAdmins: Admin[] = [
  { id: "1", name: "Sarah Williams", email: "sarah@example.com", role: "admin", status: "active", lastLogin: "2024-12-21", createdAt: "2024-01-20" },
  { id: "2", name: "David Brown", email: "david@example.com", role: "admin", status: "active", lastLogin: "2024-12-18", createdAt: "2024-04-12" },
  { id: "3", name: "Emily Clark", email: "emily@example.com", role: "admin", status: "inactive", lastLogin: "2024-11-30", createdAt: "2024-05-15" },
];

const columns: DataTableColumn<Admin>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "email", title: "Email", sortable: true },
  { key: "role", title: "Role", sortable: true, render: (a) => (
    <Badge variant="default" className="bg-primary text-primary-foreground">{a.role}</Badge>
  )},
  { key: "status", title: "Status", sortable: true, render: (a) => (
    <Badge variant={a.status === "active" ? "default" : "secondary"} className={a.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>{a.status}</Badge>
  )},
  { key: "lastLogin", title: "Last Login", sortable: true },
  { key: "createdAt", title: "Created", sortable: true },
];

export default function AdminsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins);

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setAdmins(admins.filter((a) => !ids.includes(a.id)));
  const handleStatus = (ids: string[], status: string) => setAdmins(admins.map((a) => ids.includes(a.id) ? { ...a, status } : a));

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Management" description="Manage admin users" action={<Button><Plus className="mr-2 h-4 w-4" />Add Admin</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Admins" value={admins.length} icon={UserCheck} />
        <StatCard title="Active" value={admins.filter((a) => a.status === "active").length} icon={Eye} />
        <StatCard title="Inactive" value={admins.filter((a) => a.status === "inactive").length} icon={Shield} />
        <StatCard title="New This Month" value={1} icon={UserCheck} />
      </div>
      <DataTable data={admins} columns={columns} keyExtractor={(a) => a.id} searchKeys={["name", "email", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (a) => console.log("Edit", a) }, { label: "Delete", icon: Trash2, onClick: (a) => handleDelete([a.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Activate", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
