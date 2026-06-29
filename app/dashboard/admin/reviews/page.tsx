"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Star, Trash2, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Review {
  id: string; customer: string; tour: string; rating: number; comment: string; status: string; date: string;
}

const mockReviews: Review[] = [
  { id: "1", customer: "John Doe", tour: "Annapurna Base Camp", rating: 5, comment: "Amazing experience!", status: "approved", date: "2024-12-20" },
  { id: "2", customer: "Jane Smith", tour: "Everest Base Camp", rating: 4, comment: "Great but challenging", status: "pending", date: "2024-12-19" },
  { id: "3", customer: "Mike Johnson", tour: "Langtang Valley", rating: 5, comment: "Beautiful scenery", status: "approved", date: "2024-12-18" },
  { id: "4", customer: "Sarah Williams", tour: "Annapurna Base Camp", rating: 3, comment: "Good but crowded", status: "rejected", date: "2024-12-17" },
];

const columns: DataTableColumn<Review>[] = [
  { key: "customer", title: "Customer", sortable: true },
  { key: "tour", title: "Tour", sortable: true },
  { key: "rating", title: "Rating", sortable: true, render: (r) => (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      {r.rating}
    </div>
  )},
  { key: "comment", title: "Comment", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (r) => (
    <Badge variant={r.status === "approved" ? "default" : r.status === "pending" ? "secondary" : "outline"}
      className={r.status === "approved" ? "bg-green-100 text-green-800 hover:bg-green-100" : r.status === "pending" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>{r.status}</Badge>
  )},
  { key: "date", title: "Date", sortable: true },
];

export default function ReviewsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setReviews(reviews.filter((r) => !ids.includes(r.id)));
  const handleStatus = (ids: string[], status: string) => setReviews(reviews.map((r) => ids.includes(r.id) ? { ...r, status } : r));

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Manage customer reviews" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Reviews" value={reviews.length} icon={MessageSquare} />
        <StatCard title="Approved" value={reviews.filter((r) => r.status === "approved").length} icon={CheckCircle} />
        <StatCard title="Pending" value={reviews.filter((r) => r.status === "pending").length} icon={Eye} />
        <StatCard title="Rejected" value={reviews.filter((r) => r.status === "rejected").length} icon={XCircle} />
      </div>
      <DataTable data={reviews} columns={columns} keyExtractor={(r) => r.id} searchKeys={["customer", "tour", "comment", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Approved", value: "approved" }, { label: "Pending", value: "pending" }, { label: "Rejected", value: "rejected" }] }}
        actions={[{ label: "Delete", icon: Trash2, onClick: (r) => handleDelete([r.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Approve", icon: CheckCircle, onClick: (ids) => handleStatus(ids, "approved") }, { label: "Reject", icon: XCircle, onClick: (ids) => handleStatus(ids, "rejected") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
