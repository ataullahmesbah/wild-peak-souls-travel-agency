"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Globe, Plus, Pencil, Trash2, Eye, Flag } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Country {
  id: string; name: string; code: string; region: string; status: string; destinations: number;
}

const mockCountries: Country[] = [
  { id: "1", name: "Nepal", code: "NP", region: "South Asia", status: "active", destinations: 15 },
  { id: "2", name: "India", code: "IN", region: "South Asia", status: "active", destinations: 8 },
  { id: "3", name: "Bhutan", code: "BT", region: "South Asia", status: "active", destinations: 5 },
  { id: "4", name: "Tibet", code: "CN", region: "East Asia", status: "draft", destinations: 3 },
];

const columns: DataTableColumn<Country>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "code", title: "Code", sortable: true },
  { key: "region", title: "Region", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (c) => (
    <Badge variant={c.status === "active" ? "default" : "secondary"} className={c.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{c.status}</Badge>
  )},
  { key: "destinations", title: "Destinations", sortable: true },
];

export default function CountriesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [countries, setCountries] = useState<Country[]>(mockCountries);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setCountries(countries.filter((c) => !ids.includes(c.id)));
  const handleStatus = (ids: string[], status: string) => setCountries(countries.map((c) => ids.includes(c.id) ? { ...c, status } : c));

  return (
    <div className="space-y-6">
      <PageHeader title="Countries" description="Manage countries" action={<Button><Plus className="mr-2 h-4 w-4" />Add Country</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Countries" value={countries.length} icon={Globe} />
        <StatCard title="Active" value={countries.filter((c) => c.status === "active").length} icon={Eye} />
        <StatCard title="Drafts" value={countries.filter((c) => c.status === "draft").length} icon={Pencil} />
        <StatCard title="Regions" value={new Set(countries.map((c) => c.region)).size} icon={Flag} />
      </div>
      <DataTable data={countries} columns={columns} keyExtractor={(c) => c.id} searchKeys={["name", "code", "region"]} statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (c) => console.log("Edit", c) }, { label: "Delete", icon: Trash2, onClick: (c) => handleDelete([c.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Publish", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
