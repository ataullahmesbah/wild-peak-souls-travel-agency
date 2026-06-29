"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Layers, Plus, Pencil, Trash2, Eye, Folder } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Category {
  id: string; name: string; slug: string; type: string; status: string; items: number;
}

const mockCategories: Category[] = [
  { id: "1", name: "Trekking", slug: "trekking", type: "tour", status: "active", items: 12 },
  { id: "2", name: "Peak Climbing", slug: "peak-climbing", type: "tour", status: "active", items: 5 },
  { id: "3", name: "Cultural Tours", slug: "cultural-tours", type: "tour", status: "active", items: 8 },
  { id: "4", name: "Adventure", slug: "adventure", type: "blog", status: "active", items: 15 },
  { id: "5", name: "Guides", slug: "guides", type: "blog", status: "active", items: 6 },
];

const columns: DataTableColumn<Category>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "slug", title: "Slug", sortable: true },
  { key: "type", title: "Type", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (c) => (
    <Badge variant={c.status === "active" ? "default" : "secondary"} className={c.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{c.status}</Badge>
  )},
  { key: "items", title: "Items", sortable: true },
];

export default function CategoriesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setCategories(categories.filter((c) => !ids.includes(c.id)));
  const handleStatus = (ids: string[], status: string) => setCategories(categories.map((c) => ids.includes(c.id) ? { ...c, status } : c));

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Manage content categories" action={<Button><Plus className="mr-2 h-4 w-4" />Add Category</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Categories" value={categories.length} icon={Layers} />
        <StatCard title="Active" value={categories.filter((c) => c.status === "active").length} icon={Eye} />
        <StatCard title="Tour Types" value={categories.filter((c) => c.type === "tour").length} icon={Folder} />
        <StatCard title="Blog Types" value={categories.filter((c) => c.type === "blog").length} icon={Folder} />
      </div>
      <DataTable data={categories} columns={columns} keyExtractor={(c) => c.id} searchKeys={["name", "slug", "type"]} statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (c) => console.log("Edit", c) }, { label: "Delete", icon: Trash2, onClick: (c) => handleDelete([c.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Activate", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
