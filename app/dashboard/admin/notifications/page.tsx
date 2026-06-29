"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Bell, Plus, Pencil, Trash2, Eye, Send } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Notification {
  id: string; title: string; type: string; audience: string; status: string; sentAt: string; recipients: number;
}

const mockNotifications: Notification[] = [
  { id: "1", title: "New Year Sale", type: "promo", audience: "all", status: "sent", sentAt: "2024-12-20", recipients: 1200 },
  { id: "2", title: "Tour Update", type: "update", audience: "customers", status: "sent", sentAt: "2024-12-19", recipients: 450 },
  { id: "3", title: "System Maintenance", type: "system", audience: "all", status: "draft", sentAt: "", recipients: 0 },
  { id: "4", title: "Guide Assignment", type: "guide", audience: "guides", status: "sent", sentAt: "2024-12-18", recipients: 34 },
];

const columns: DataTableColumn<Notification>[] = [
  { key: "title", title: "Title", sortable: true },
  { key: "type", title: "Type", sortable: true },
  { key: "audience", title: "Audience", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (n) => (
    <Badge variant={n.status === "sent" ? "default" : "secondary"} className={n.status === "sent" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{n.status}</Badge>
  )},
  { key: "sentAt", title: "Sent", sortable: true },
  { key: "recipients", title: "Recipients", sortable: true },
];

export default function NotificationsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setNotifications(notifications.filter((n) => !ids.includes(n.id)));
  const handleStatus = (ids: string[], status: string) => setNotifications(notifications.map((n) => ids.includes(n.id) ? { ...n, status } : n));

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Send and manage notifications" action={<Button><Plus className="mr-2 h-4 w-4" />New Notification</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={notifications.length} icon={Bell} />
        <StatCard title="Sent" value={notifications.filter((n) => n.status === "sent").length} icon={Send} />
        <StatCard title="Drafts" value={notifications.filter((n) => n.status === "draft").length} icon={Eye} />
        <StatCard title="Total Recipients" value={notifications.reduce((a, n) => a + n.recipients, 1).toLocaleString()} icon={Bell} />
      </div>
      <DataTable data={notifications} columns={columns} keyExtractor={(n) => n.id} searchKeys={["title", "type", "audience", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Sent", value: "sent" }, { label: "Draft", value: "draft" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (n) => console.log("Edit", n) }, { label: "Delete", icon: Trash2, onClick: (n) => handleDelete([n.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Send", icon: Send, onClick: (ids) => handleStatus(ids, "sent") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
