"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Users, Plus, Pencil, Trash2, Shield, Mail, Calendar } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  verified: boolean;
  createdAt: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "customer", status: "active", verified: true, createdAt: "2024-01-15", lastLogin: "2024-12-20" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "guide", status: "active", verified: true, createdAt: "2024-02-10", lastLogin: "2024-12-19" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", role: "customer", status: "inactive", verified: false, createdAt: "2024-03-05", lastLogin: "2024-11-30" },
  { id: "4", name: "Sarah Williams", email: "sarah@example.com", role: "admin", status: "active", verified: true, createdAt: "2024-01-20", lastLogin: "2024-12-21" },
  { id: "5", name: "David Brown", email: "david@example.com", role: "moderator", status: "active", verified: true, createdAt: "2024-04-12", lastLogin: "2024-12-18" },
  { id: "6", name: "Emily Davis", email: "emily@example.com", role: "customer", status: "active", verified: true, createdAt: "2024-05-20", lastLogin: "2024-12-20" },
  { id: "7", name: "Chris Wilson", email: "chris@example.com", role: "guide", status: "inactive", verified: true, createdAt: "2024-06-15", lastLogin: "2024-10-15" },
  { id: "8", name: "Lisa Anderson", email: "lisa@example.com", role: "customer", status: "active", verified: false, createdAt: "2024-07-01", lastLogin: "2024-12-15" },
];

const columns: DataTableColumn<User>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "email", title: "Email", sortable: true },
  { key: "role", title: "Role", sortable: true, render: (user) => (
    <Badge variant={user.role === "admin" ? "default" : user.role === "guide" ? "secondary" : "outline"}>
      {user.role}
    </Badge>
  )},
  { key: "status", title: "Status", sortable: true, render: (user) => (
    <Badge variant={user.status === "active" ? "default" : "secondary"} className={user.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
      {user.status}
    </Badge>
  )},
  { key: "verified", title: "Verified", sortable: true, render: (user) => (
    <Badge variant={user.verified ? "default" : "outline"} className={user.verified ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}>
      {user.verified ? "Yes" : "No"}
    </Badge>
  )},
  { key: "createdAt", title: "Joined", sortable: true },
  { key: "lastLogin", title: "Last Login", sortable: true },
];

export default function UsersPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [users, setUsers] = useState<User[]>(mockUsers);

  if (!isAdmin(role)) {
    redirect(getDashboardPathForRole(role));
  }

  const handleDelete = (ids: string[]) => {
    setUsers(users.filter((u) => !ids.includes(u.id)));
  };

  const handleEdit = (user: User) => {
    // Edit modal would open here
    console.log("Edit user:", user);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage all registered users"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={users.length} icon={Users} />
        <StatCard title="Active" value={users.filter((u) => u.status === "active").length} icon={Shield} />
        <StatCard title="Verified" value={users.filter((u) => u.verified).length} icon={Mail} />
        <StatCard title="New This Month" value={3} icon={Calendar} />
      </div>

      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id}
        searchKeys={["name", "email", "role"]}
        statusFilter={{
          key: "status",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        }}
        actions={[
          {
            label: "Edit",
            icon: Pencil,
            onClick: handleEdit,
          },
          {
            label: "Delete",
            icon: Trash2,
            onClick: (user) => handleDelete([user.id]),
            variant: "destructive",
          },
        ]}
        bulkActions={[
          {
            label: "Delete Selected",
            icon: Trash2,
            onClick: handleDelete,
            variant: "destructive",
          },
        ]}
      />
    </div>
  );
}
