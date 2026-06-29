"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Navigation, Plus, Pencil, Trash2, Eye, MapPin } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface City {
  id: string; name: string; country: string; status: string; tours: number;
}

const mockCities: City[] = [
  { id: "1", name: "Kathmandu", country: "Nepal", status: "active", tours: 8 },
  { id: "2", name: "Pokhara", country: "Nepal", status: "active", tours: 12 },
  { id: "3", name: "Lukla", country: "Nepal", status: "active", tours: 5 },
  { id: "4", name: "Chitwan", country: "Nepal", status: "draft", tours: 3 },
];

const columns: DataTableColumn<City>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "country", title: "Country", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (c) => (
    <Badge variant={c.status === "active" ? "default" : "secondary"} className={c.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{c.status}</Badge>
  )},
  { key: "tours", title: "Tours", sortable: true },
];

export default function CitiesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [cities, setCities] = useState<City[]>(mockCities);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setCities(cities.filter((c) => !ids.includes(c.id)));
  const handleStatus = (ids: string[], status: string) => setCities(cities.map((c) => ids.includes(c.id) ? { ...c, status } : c));

  return (
    <div className="space-y-6">
      <PageHeader title="Cities" description="Manage cities" action={<Button><Plus className="mr-2 h-4 w-4" />Add City</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Cities" value={cities.length} icon={Navigation} />
        <StatCard title="Active" value={cities.filter((c) => c.status === "active").length} icon={Eye} />
        <StatCard title="Drafts" value={cities.filter((c) => c.status === "draft").length} icon={Pencil} />
        <StatCard title="Countries" value={new Set(cities.map((c) => c.country)).size} icon={MapPin} />
      </div>
      <DataTable data={cities} columns={columns} keyExtractor={(c) => c.id} searchKeys={["name", "country"]} statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (c) => console.log("Edit", c) }, { label: "Delete", icon: Trash2, onClick: (c) => handleDelete([c.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Publish", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
