"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Compass, Plus, Pencil, Trash2, Eye, Star, Calendar } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Guide {
  id: string; name: string; email: string; experience: number; rating: number; tours: number; status: string;
}

const mockGuides: Guide[] = [
  { id: "1", name: "Guide Mike", email: "mike@example.com", experience: 8, rating: 4.8, tours: 45, status: "active" },
  { id: "2", name: "Guide Jane", email: "jane@example.com", experience: 5, rating: 4.9, tours: 32, status: "active" },
  { id: "3", name: "Guide David", email: "david@example.com", experience: 3, rating: 4.5, tours: 18, status: "inactive" },
  { id: "4", name: "Guide Sarah", email: "sarah@example.com", experience: 10, rating: 4.7, tours: 67, status: "active" },
];

const columns: DataTableColumn<Guide>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "email", title: "Email", sortable: true },
  { key: "experience", title: "Experience (yrs)", sortable: true },
  { key: "rating", title: "Rating", sortable: true, render: (g) => (
    <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />{g.rating}</div>
  )},
  { key: "tours", title: "Tours", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (g) => (
    <Badge variant={g.status === "active" ? "default" : "secondary"} className={g.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>{g.status}</Badge>
  )},
];

export default function GuidesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [guides, setGuides] = useState<Guide[]>(mockGuides);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setGuides(guides.filter((g) => !ids.includes(g.id)));
  const handleStatus = (ids: string[], status: string) => setGuides(guides.map((g) => ids.includes(g.id) ? { ...g, status } : g));

  return (
    <div className="space-y-6">
      <PageHeader title="Travel Guides" description="Manage travel guides" action={<Button><Plus className="mr-2 h-4 w-4" />Add Guide</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Guides" value={guides.length} icon={Compass} />
        <StatCard title="Active" value={guides.filter((g) => g.status === "active").length} icon={Eye} />
        <StatCard title="Avg Rating" value={(guides.reduce((a, g) => a + g.rating, 0) / guides.length).toFixed(1)} icon={Star} />
        <StatCard title="Total Tours" value={guides.reduce((a, g) => a + g.tours, 0)} icon={Calendar} />
      </div>
      <DataTable data={guides} columns={columns} keyExtractor={(g) => g.id} searchKeys={["name", "email", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (g) => console.log("Edit", g) }, { label: "Delete", icon: Trash2, onClick: (g) => handleDelete([g.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Activate", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
