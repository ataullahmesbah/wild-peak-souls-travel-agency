"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Mountain, Plus, Pencil, Trash2, Eye, Star, AlertTriangle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";
import {
  getAdminTours,
  deleteTour,
  bulkDeleteTours,
  bulkUpdateTourStatus,
  updateTourStatus,
} from "@/app/actions/tours";

interface Tour {
  id: string;
  title: string;
  slug: string;
  category: { name: string } | null;
  destination: { title: string } | null;
  country: { name: string } | null;
  duration: string | null;
  startingPrice: number | null;
  status: string;
  averageRating: number | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { reviews: number; bookings: number };
}

export default function ToursPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminTours(page, 20);
    if (result.success && result.data) {
      setTours(result.data.tours as Tour[]);
      setTotal(result.data.total);
    } else {
      setError(result.error || "Failed to load tours");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    const result = await deleteTour(id);
    if (result.success) {
      setTours(tours.filter((t) => t.id !== id));
      setTotal((t) => t - 1);
    } else {
      alert(result.error || "Failed to delete tour");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    const result = await bulkDeleteTours(ids);
    if (result.success) {
      setTours(tours.filter((t) => !ids.includes(t.id)));
      setTotal((t) => t - ids.length);
    } else {
      alert(result.error || "Failed to delete tours");
    }
  };

  const handleBulkStatus = async (ids: string[], status: string) => {
    const result = await bulkUpdateTourStatus(ids, status);
    if (result.success) {
      setTours(tours.map((t) => (ids.includes(t.id) ? { ...t, status } : t)));
    } else {
      alert(result.error || "Failed to update status");
    }
  };

  const handleStatusToggle = async (id: string) => {
    const tour = tours.find((t) => t.id === id);
    if (!tour) return;
    const newStatus = tour.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const result = await updateTourStatus(id, newStatus);
    if (result.success) {
      setTours(tours.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    } else {
      alert(result.error || "Failed to update status");
    }
  };

  const columns: DataTableColumn<Tour>[] = [
    { key: "title", title: "Title", sortable: true },
    { key: "destination", title: "Destination", sortable: true, render: (t) => t.destination?.title ?? "—" },
    { key: "duration", title: "Duration", sortable: true, render: (t) => t.duration ?? "—" },
    { key: "startingPrice", title: "Price", sortable: true, render: (t) => t.startingPrice ? `$${t.startingPrice}` : "—" },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (t) => (
        <Badge
          variant={t.status === "PUBLISHED" ? "default" : t.status === "DRAFT" ? "secondary" : "outline"}
          className={t.status === "PUBLISHED" ? "bg-green-100 text-green-800 hover:bg-green-100" : t.status === "DRAFT" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : ""}
        >
          {t.status}
        </Badge>
      ),
    },
    {
      key: "rating",
      title: "Rating",
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          {t.averageRating ?? 0}
        </div>
      ),
    },
    {
      key: "bookings",
      title: "Bookings",
      sortable: true,
      render: (t) => t._count?.bookings ?? 0,
    },
    {
      key: "featured",
      title: "Featured",
      render: (t) => (
        <Badge variant={t.isFeatured ? "default" : "outline"}>
          {t.isFeatured ? "Featured" : "—"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      sortable: true,
      render: (t) => new Date(t.createdAt).toLocaleDateString("en-US"),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tours" description="Manage tour packages" />
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
        title="Tours"
        description="Manage tour packages"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tour
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tours" value={total} icon={Mountain} />
        <StatCard title="Active" value={tours.filter((t) => t.status === "PUBLISHED").length} icon={Eye} />
        <StatCard title="Drafts" value={tours.filter((t) => t.status === "DRAFT").length} icon={Pencil} />
        <StatCard title="Featured" value={tours.filter((t) => t.isFeatured).length} icon={Star} />
      </div>
      <DataTable
        data={tours}
        columns={columns}
        keyExtractor={(t) => t.id}
        searchKeys={["title", "slug", "destination", "status"]}
        statusFilter={{
          key: "status",
          options: [
            { label: "Published", value: "PUBLISHED" },
            { label: "Draft", value: "DRAFT" },
            { label: "Archived", value: "ARCHIVED" },
          ],
        }}
        actions={[
          { label: "Edit", icon: Pencil, onClick: (t) => console.log("Edit", t.id) },
          { label: "Toggle Status", icon: Eye, onClick: (t) => handleStatusToggle(t.id) },
          { label: "Delete", icon: Trash2, onClick: (t) => handleDelete(t.id), variant: "destructive" },
        ]}
        bulkActions={[
          { label: "Publish", icon: Eye, onClick: (ids) => handleBulkStatus(ids, "PUBLISHED") },
          { label: "Draft", icon: Pencil, onClick: (ids) => handleBulkStatus(ids, "DRAFT") },
          { label: "Delete", icon: Trash2, onClick: handleBulkDelete, variant: "destructive" },
        ]}
      />
      {loading && tours.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-muted-foreground">Loading tours...</span>
        </div>
      )}
    </div>
  );
}
