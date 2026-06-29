"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Calendar, Plus, Pencil, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Booking {
  id: string;
  customer: string;
  tour: string;
  date: string;
  status: string;
  amount: number;
  guests: number;
  createdAt: string;
}

const mockBookings: Booking[] = [
  { id: "1", customer: "John Doe", tour: "Annapurna Base Camp", date: "2024-12-15", status: "confirmed", amount: 1200, guests: 2, createdAt: "2024-11-20" },
  { id: "2", customer: "Jane Smith", tour: "Everest Base Camp", date: "2025-01-20", status: "pending", amount: 2500, guests: 1, createdAt: "2024-12-01" },
  { id: "3", customer: "Mike Johnson", tour: "Langtang Valley", date: "2024-12-10", status: "completed", amount: 800, guests: 3, createdAt: "2024-11-15" },
  { id: "4", customer: "Sarah Williams", tour: "Manaslu Circuit", date: "2025-02-01", status: "confirmed", amount: 1800, guests: 2, createdAt: "2024-12-05" },
  { id: "5", customer: "David Brown", tour: "Annapurna Base Camp", date: "2025-03-15", status: "pending", amount: 1200, guests: 4, createdAt: "2024-12-10" },
  { id: "6", customer: "Emily Davis", tour: "Ghorepani Poon Hill", date: "2024-12-25", status: "confirmed", amount: 600, guests: 2, createdAt: "2024-11-30" },
];

const columns: DataTableColumn<Booking>[] = [
  { key: "customer", title: "Customer", sortable: true },
  { key: "tour", title: "Tour", sortable: true },
  { key: "date", title: "Date", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (booking) => (
    <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "pending" ? "secondary" : "outline"}
      className={booking.status === "confirmed" ? "bg-green-100 text-green-800 hover:bg-green-100" : booking.status === "pending" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : "bg-blue-100 text-blue-800 hover:bg-blue-100"}>
      {booking.status}
    </Badge>
  )},
  { key: "amount", title: "Amount", sortable: true, render: (booking) => `$${booking.amount}` },
  { key: "guests", title: "Guests", sortable: true },
  { key: "createdAt", title: "Booked On", sortable: true },
];

export default function BookingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  if (!isAdmin(role)) {
    redirect(getDashboardPathForRole(role));
  }

  const handleDelete = (ids: string[]) => {
    setBookings(bookings.filter((b) => !ids.includes(b.id)));
  };

  const handleStatusChange = (ids: string[], status: string) => {
    setBookings(bookings.map((b) => (ids.includes(b.id) ? { ...b, status } : b)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Manage tour and event bookings"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Booking
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Bookings" value={bookings.length} icon={Calendar} />
        <StatCard title="Confirmed" value={bookings.filter((b) => b.status === "confirmed").length} icon={CheckCircle} />
        <StatCard title="Pending" value={bookings.filter((b) => b.status === "pending").length} icon={Clock} />
        <StatCard title="Completed" value={bookings.filter((b) => b.status === "completed").length} icon={XCircle} />
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        keyExtractor={(b) => b.id}
        searchKeys={["customer", "tour", "status"]}
        statusFilter={{
          key: "status",
          options: [
            { label: "Confirmed", value: "confirmed" },
            { label: "Pending", value: "pending" },
            { label: "Completed", value: "completed" },
          ],
        }}
        actions={[
          { label: "Edit", icon: Pencil, onClick: (b) => console.log("Edit", b) },
          { label: "Delete", icon: Trash2, onClick: (b) => handleDelete([b.id]), variant: "destructive" },
        ]}
        bulkActions={[
          { label: "Confirm", icon: CheckCircle, onClick: (ids) => handleStatusChange(ids, "confirmed") },
          { label: "Complete", icon: XCircle, onClick: (ids) => handleStatusChange(ids, "completed") },
          { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" },
        ]}
      />
    </div>
  );
}
