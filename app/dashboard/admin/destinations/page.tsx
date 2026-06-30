"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2, Eye, Star, AlertTriangle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";
import {
  getAdminDestinations,
  deleteDestination,
  bulkDeleteDestinations,
} from "@/app/actions/destinations";
import { adminToggleField } from "@/app/actions/admin";

interface Destination {
  id: string;
  title: string;
  slug: string;
  country: { name: string } | null;
  city: { name: string } | null;
  altitude: string | null;
  climate: string | null;
  bestSeason: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { tours: number; events: number };
}

export default function DestinationsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminDestinations(page, 20);
    if (result.success && result.data) {
      setDestinations(result.data.destinations as Destination[]);
      setTotal(result.data.total);
    } else {
      setError(result.error || "Failed to load destinations");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    const result = await deleteDestination(id);
    if (result.success) {
      setDestinations(destinations.filter((d) => d.id !== id));
      setTotal((t) => t - 1);
    } else {
      alert(result.error || "Failed to delete destination");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    const result = await bulkDeleteDestinations(ids);
    if (result.success) {
      setDestinations(destinations.filter((d) => !ids.includes(d.id)));
      setTotal((t) => t - ids.length);
    } else {
      alert(result.error || "Failed to delete destinations");
    }
  };

  const handleToggle = async (id: string) => {
    const result = await adminToggleField("destinations", id, "isActive");
    if (result.success) {
      setDestinations(destinations.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)));
    } else {
      alert(result.error || "Failed to toggle status");
    }
  };

  const columns: DataTableColumn<Destination>[] = [
    { key: "title", title: "Title", sortable: true },
    { key: "country", title: "Country", sortable: true, render: (d) => d.country?.name ?? "—" },
    { key: "city", title: "City", sortable: true, render: (d) => d.city?.name ?? "—" },
    { key: "altitude", title: "Altitude", render: (d) => d.altitude ?? "—" },
    { key: "climate", title: "Climate", render: (d) => d.climate ?? "—" },
    {
      key: "status",
      title: "Status",
      render: (d) => (
        <Badge
          variant={d.isActive ? "default" : "outline"}
          className={d.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
        >
          {d.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "tours",
      title: "Tours",
      render: (d) => d._count?.tours ?? 0,
    },
    {
      key: "events",
      title: "Events",
      render: (d) => d._count?.events ?? 0,
    },
    {
      key: "featured",
      title: "Featured",
      render: (d) => (
        <Badge variant={d.isFeatured ? "default" : "outline"}>
          {d.isFeatured ? "Featured" : "—"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      sortable: true,
      render: (d) => new Date(d.createdAt).toLocaleDateString("en-US"),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Destinations" description="Manage destinations" />
        <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destinations"
        description="Manage destinations"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Destination
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={total} icon={MapPin} />
        <StatCard title="Active" value={destinations.filter((d) => d.isActive).length} icon={Eye} />
        <StatCard title="Inactive" value={destinations.filter((d) => !d.isActive).length} icon={Pencil} />
        <StatCard title="Featured" value={destinations.filter((d) => d.isFeatured).length} icon={Star} />
      </div>
      <DataTable
        data={destinations}
        columns={columns}
        keyExtractor={(d) => d.id}
        searchKeys={["title", "slug", "country", "status"]}
        statusFilter={{
          key: "isActive",
          options: [
            { label: "Active", value: "true" },
            { label: "Inactive", value: "false" },
          ],
        }}
        actions={[
          { label: "Edit", icon: Pencil, onClick: (d) => console.log("Edit", d.id) },
          { label: "Toggle Status", icon: Eye, onClick: (d) => handleToggle(d.id) },
          { label: "Delete", icon: Trash2, onClick: (d) => handleDelete(d.id), variant: "destructive" },
        ]}
        bulkActions={[
          { label: "Delete", icon: Trash2, onClick: handleBulkDelete, variant: "destructive" },
        ]}
      />
      {loading && destinations.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-muted-foreground">Loading destinations...</span>
        </div>
      )}
    </div>
  );
}
