"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2, Eye, Globe } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Destination {
  id: string; name: string; country: string; region: string; status: string; tours: number; rating: number;
}

const mockDestinations: Destination[] = [
  { id: "1", name: "Annapurna Region", country: "Nepal", region: "Gandaki", status: "active", tours: 12, rating: 4.8 },
  { id: "2", name: "Everest Region", country: "Nepal", region: "Koshi", status: "active", tours: 8, rating: 4.9 },
  { id: "3", name: "Langtang Valley", country: "Nepal", region: "Bagmati", status: "active", tours: 5, rating: 4.6 },
  { id: "4", name: "Manaslu Region", country: "Nepal", region: "Gandaki", status: "draft", tours: 3, rating: 4.7 },
  { id: "5", name: "Mustang Region", country: "Nepal", region: "Gandaki", status: "active", tours: 6, rating: 4.8 },
];

const columns: DataTableColumn<Destination>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "country", title: "Country", sortable: true },
  { key: "region", title: "Region", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (d) => (
    <Badge variant={d.status === "active" ? "default" : "secondary"} className={d.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{d.status}</Badge>
  )},
  { key: "tours", title: "Tours", sortable: true },
  { key: "rating", title: "Rating", sortable: true },
];

export default function DestinationsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [destinations, setDestinations] = useState<Destination[]>(mockDestinations);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setDestinations(destinations.filter((d) => !ids.includes(d.id)));
  const handleStatus = (ids: string[], status: string) => setDestinations(destinations.map((d) => ids.includes(d.id) ? { ...d, status } : d));

  return (
    <div className="space-y-6">
      <PageHeader title="Destinations" description="Manage travel destinations" action={<Button><Plus className="mr-2 h-4 w-4" />Add Destination</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Destinations" value={destinations.length} icon={MapPin} />
        <StatCard title="Active" value={destinations.filter((d) => d.status === "active").length} icon={Eye} />
        <StatCard title="Drafts" value={destinations.filter((d) => d.status === "draft").length} icon={Pencil} />
        <StatCard title="Countries" value={new Set(destinations.map((d) => d.country)).size} icon={Globe} />
      </div>
      <DataTable data={destinations} columns={columns} keyExtractor={(d) => d.id} searchKeys={["name", "country", "region"]} statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (d) => console.log("Edit", d) }, { label: "Delete", icon: Trash2, onClick: (d) => handleDelete([d.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Publish", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
