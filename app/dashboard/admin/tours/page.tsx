"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Mountain, Plus, Pencil, Trash2, Eye, Star } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Tour {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  status: string;
  rating: number;
  bookings: number;
  createdAt: string;
}

const mockTours: Tour[] = [
  { id: "1", title: "Annapurna Base Camp Trek", destination: "Annapurna", duration: "7 days", price: 1200, status: "active", rating: 4.8, bookings: 145, createdAt: "2024-01-15" },
  { id: "2", title: "Everest Base Camp Trek", destination: "Everest", duration: "14 days", price: 2500, status: "active", rating: 4.9, bookings: 98, createdAt: "2024-02-10" },
  { id: "3", title: "Langtang Valley Trek", destination: "Langtang", duration: "5 days", price: 800, status: "active", rating: 4.6, bookings: 76, createdAt: "2024-03-05" },
  { id: "4", title: "Manaslu Circuit Trek", destination: "Manaslu", duration: "12 days", price: 1800, status: "draft", rating: 4.7, bookings: 54, createdAt: "2024-04-12" },
  { id: "5", title: "Ghorepani Poon Hill", destination: "Poon Hill", duration: "3 days", price: 600, status: "active", rating: 4.5, bookings: 112, createdAt: "2024-05-20" },
  { id: "6", title: "Upper Mustang Trek", destination: "Mustang", duration: "10 days", price: 2200, status: "inactive", rating: 4.8, bookings: 34, createdAt: "2024-06-15" },
];

const columns: DataTableColumn<Tour>[] = [
  { key: "title", title: "Title", sortable: true },
  { key: "destination", title: "Destination", sortable: true },
  { key: "duration", title: "Duration", sortable: true },
  { key: "price", title: "Price", sortable: true, render: (t) => `$${t.price}` },
  { key: "status", title: "Status", sortable: true, render: (t) => (
    <Badge variant={t.status === "active" ? "default" : t.status === "draft" ? "secondary" : "outline"}
      className={t.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : t.status === "draft" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : ""}>
      {t.status}
    </Badge>
  )},
  { key: "rating", title: "Rating", sortable: true, render: (t) => (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      {t.rating}
    </div>
  )},
  { key: "bookings", title: "Bookings", sortable: true },
];

export default function ToursPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [tours, setTours] = useState<Tour[]>(mockTours);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setTours(tours.filter((t) => !ids.includes(t.id)));
  const handleStatus = (ids: string[], status: string) => setTours(tours.map((t) => ids.includes(t.id) ? { ...t, status } : t));

  return (
    <div className="space-y-6">
      <PageHeader title="Tours" description="Manage tour packages" action={<Button><Plus className="mr-2 h-4 w-4" />Add Tour</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tours" value={tours.length} icon={Mountain} />
        <StatCard title="Active" value={tours.filter((t) => t.status === "active").length} icon={Eye} />
        <StatCard title="Drafts" value={tours.filter((t) => t.status === "draft").length} icon={Pencil} />
        <StatCard title="Total Bookings" value={tours.reduce((a, t) => a + t.bookings, 0)} icon={Star} />
      </div>
      <DataTable data={tours} columns={columns} keyExtractor={(t) => t.id} searchKeys={["title", "destination", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }, { label: "Inactive", value: "inactive" }] }}
        actions={[
          { label: "Edit", icon: Pencil, onClick: (t) => console.log("Edit", t) },
          { label: "Delete", icon: Trash2, onClick: (t) => handleDelete([t.id]), variant: "destructive" },
        ]}
        bulkActions={[
          { label: "Publish", icon: Eye, onClick: (ids) => handleStatus(ids, "active") },
          { label: "Draft", icon: Pencil, onClick: (ids) => handleStatus(ids, "draft") },
          { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" },
        ]}
      />
    </div>
  );
}
