"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Calendar, Plus, Pencil, Trash2, Eye, Star, AlertTriangle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";
import {
  getAdminEvents,
  deleteEvent,
  bulkDeleteEvents,
  bulkUpdateEventStatus,
  updateEventStatus,
} from "@/app/actions/events";

interface Event {
  id: string;
  title: string;
  slug: string;
  category: { name: string } | null;
  destination: { title: string } | null;
  country: { name: string } | null;
  eventType: string;
  startDate: Date | null;
  endDate: Date | null;
  startingPrice: number | null;
  pricePerPerson: number | null;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  availableSeats: number | null;
  maximumCapacity: number | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { bookings: number };
}

export default function EventsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminEvents(page, 20);
    if (result.success && result.data) {
      setEvents(result.data.events as Event[]);
      setTotal(result.data.total);
    } else {
      setError(result.error || "Failed to load events");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    const result = await deleteEvent(id);
    if (result.success) {
      setEvents(events.filter((e) => e.id !== id));
      setTotal((t) => t - 1);
    } else {
      alert(result.error || "Failed to delete event");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    const result = await bulkDeleteEvents(ids);
    if (result.success) {
      setEvents(events.filter((e) => !ids.includes(e.id)));
      setTotal((t) => t - ids.length);
    } else {
      alert(result.error || "Failed to delete events");
    }
  };

  const handleBulkStatus = async (ids: string[], status: string) => {
    const result = await bulkUpdateEventStatus(ids, status);
    if (result.success) {
      setEvents(events.map((e) => (ids.includes(e.id) ? { ...e, status } : e)));
    } else {
      alert(result.error || "Failed to update status");
    }
  };

  const handleStatusToggle = async (id: string) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const newStatus = event.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const result = await updateEventStatus(id, newStatus);
    if (result.success) {
      setEvents(events.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    } else {
      alert(result.error || "Failed to update status");
    }
  };

  const columns: DataTableColumn<Event>[] = [
    { key: "title", title: "Title", sortable: true },
    { key: "category", title: "Category", sortable: true, render: (e) => e.category?.name ?? "—" },
    { key: "eventType", title: "Type", sortable: true },
    { key: "startDate", title: "Start Date", sortable: true, render: (e) => e.startDate ? new Date(e.startDate).toLocaleDateString() : "—" },
    { key: "startingPrice", title: "Price", sortable: true, render: (e) => e.startingPrice || e.pricePerPerson ? `$${e.startingPrice || e.pricePerPerson}` : "—" },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (e) => (
        <Badge
          variant={e.status === "PUBLISHED" ? "default" : e.status === "DRAFT" ? "secondary" : "outline"}
          className={e.status === "PUBLISHED" ? "bg-green-100 text-green-800 hover:bg-green-100" : e.status === "DRAFT" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : ""}
        >
          {e.status}
        </Badge>
      ),
    },
    {
      key: "seats",
      title: "Seats",
      render: (e) => `${e.availableSeats ?? 0} / ${e.maximumCapacity ?? 0}`,
    },
    {
      key: "bookings",
      title: "Bookings",
      render: (e) => e._count?.bookings ?? 0,
    },
    {
      key: "featured",
      title: "Featured",
      render: (e) => (
        <Badge variant={e.isFeatured ? "default" : "outline"}>
          {e.isFeatured ? "Featured" : "—"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      sortable: true,
      render: (e) => new Date(e.createdAt).toLocaleDateString("en-US"),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Events" description="Manage events" />
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
        title="Events"
        description="Manage events and expeditions"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={total} icon={Calendar} />
        <StatCard title="Published" value={events.filter((e) => e.status === "PUBLISHED").length} icon={Eye} />
        <StatCard title="Drafts" value={events.filter((e) => e.status === "DRAFT").length} icon={Pencil} />
        <StatCard title="Featured" value={events.filter((e) => e.isFeatured).length} icon={Star} />
      </div>
      <DataTable
        data={events}
        columns={columns}
        keyExtractor={(e) => e.id}
        searchKeys={["title", "slug", "eventType", "status"]}
        statusFilter={{
          key: "status",
          options: [
            { label: "Published", value: "PUBLISHED" },
            { label: "Draft", value: "DRAFT" },
            { label: "Archived", value: "ARCHIVED" },
            { label: "Sold Out", value: "SOLDOUT" },
            { label: "Cancelled", value: "CANCELLED" },
          ],
        }}
        actions={[
          { label: "Edit", icon: Pencil, onClick: (e) => console.log("Edit", e.id) },
          { label: "Toggle Status", icon: Eye, onClick: (e) => handleStatusToggle(e.id) },
          { label: "Delete", icon: Trash2, onClick: (e) => handleDelete(e.id), variant: "destructive" },
        ]}
        bulkActions={[
          { label: "Publish", icon: Eye, onClick: (ids) => handleBulkStatus(ids, "PUBLISHED") },
          { label: "Draft", icon: Pencil, onClick: (ids) => handleBulkStatus(ids, "DRAFT") },
          { label: "Delete", icon: Trash2, onClick: handleBulkDelete, variant: "destructive" },
        ]}
      />
      {loading && events.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-muted-foreground">Loading events...</span>
        </div>
      )}
    </div>
  );
}
