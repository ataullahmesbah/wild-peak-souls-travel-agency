"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { BookOpen, Users, CheckCircle, Clock, DollarSign, Calendar } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isGuide } from "@/lib/roles";

interface GuideBooking {
  id: string;
  bookingRef: string;
  customer: string;
  tour: string;
  date: string;
  participants: number;
  status: string;
  total: number;
}

const mockBookings: GuideBooking[] = [
  { id: "1", bookingRef: "WPS-2024-001", customer: "John Doe", tour: "Annapurna Base Camp", date: "2024-12-25", participants: 2, status: "confirmed", total: 1200 },
  { id: "2", bookingRef: "WPS-2024-002", customer: "Jane Smith", tour: "Everest Base Camp", date: "2025-01-15", participants: 1, status: "pending", total: 2500 },
  { id: "3", bookingRef: "WPS-2024-003", customer: "Mike Johnson", tour: "Langtang Valley", date: "2024-11-10", participants: 3, status: "completed", total: 800 },
];

const columns: DataTableColumn<GuideBooking>[] = [
  { key: "bookingRef", title: "Ref", sortable: true },
  { key: "customer", title: "Customer", sortable: true },
  { key: "tour", title: "Tour", sortable: true },
  { key: "date", title: "Date", sortable: true },
  { key: "participants", title: "Guests", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (b) => (
    <Badge variant={b.status === "confirmed" ? "default" : "secondary"} className={b.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{b.status}</Badge>
  )},
  { key: "total", title: "Total", sortable: true, render: (b) => `$${b.total}` },
];

export default function GuideBookingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [bookings] = useState<GuideBooking[]>(mockBookings);

  if (!isGuide(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Bookings for your tours" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Bookings" value={bookings.length} icon={BookOpen} />
        <StatCard title="Confirmed" value={bookings.filter((b) => b.status === "confirmed").length} icon={CheckCircle} />
        <StatCard title="Pending" value={bookings.filter((b) => b.status === "pending").length} icon={Clock} />
        <StatCard title="Total Revenue" value={`$${bookings.reduce((a, b) => a + b.total, 0)}`} icon={DollarSign} />
      </div>
      <DataTable data={bookings} columns={columns} keyExtractor={(b) => b.id} searchKeys={["bookingRef", "customer", "tour"]} />
    </div>
  );
}
