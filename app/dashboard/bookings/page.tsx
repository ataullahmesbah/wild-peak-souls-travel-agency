"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Calendar, Package, Clock, CheckCircle, XCircle, MapPin, Eye, Download } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MyBooking {
  id: string;
  bookingRef: string;
  itemName: string;
  type: string;
  date: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  participants: number;
}

const mockBookings: MyBooking[] = [
  { id: "1", bookingRef: "WPS-2024-ABC", itemName: "Annapurna Base Camp Trek", type: "tour", date: "2024-12-25", status: "CONFIRMED", paymentStatus: "PAID", totalAmount: 1200, participants: 2 },
  { id: "2", bookingRef: "WPS-2024-DEF", itemName: "Everest Marathon", type: "event", date: "2025-05-29", status: "PENDING", paymentStatus: "UNPAID", totalAmount: 250, participants: 1 },
  { id: "3", bookingRef: "WPS-2024-GHI", itemName: "Langtang Valley Trek", type: "tour", date: "2024-11-15", status: "COMPLETED", paymentStatus: "PAID", totalAmount: 800, participants: 3 },
  { id: "4", bookingRef: "WPS-2024-JKL", itemName: "Yoga Retreat", type: "event", date: "2024-12-28", status: "CANCELLED", paymentStatus: "REFUNDED", totalAmount: 150, participants: 1 },
];

const columns: DataTableColumn<MyBooking>[] = [
  { key: "bookingRef", title: "Reference", sortable: true },
  { key: "itemName", title: "Booking", sortable: true },
  { key: "date", title: "Date", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (b) => (
    <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "PENDING" ? "secondary" : b.status === "COMPLETED" ? "default" : "outline"}
      className={b.status === "CONFIRMED" ? "bg-green-100 text-green-800 hover:bg-green-100" : b.status === "PENDING" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : b.status === "COMPLETED" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>{b.status}</Badge>
  )},
  { key: "paymentStatus", title: "Payment", sortable: true, render: (b) => (
    <Badge variant={b.paymentStatus === "PAID" ? "default" : "secondary"} className={b.paymentStatus === "PAID" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{b.paymentStatus}</Badge>
  )},
  { key: "totalAmount", title: "Amount", sortable: true, render: (b) => `$${b.totalAmount}` },
  { key: "participants", title: "Guests", sortable: true },
];

export default function MyBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<MyBooking[]>(mockBookings);
  const [activeTab, setActiveTab] = useState("all");

  if (!session) redirect("/login?callbackUrl=/dashboard/bookings");

  const filtered = activeTab === "all" ? bookings : bookings.filter((b) => b.status.toLowerCase() === activeTab);

  const stats = {
    total: bookings.length,
    active: bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Bookings" description="Manage your bookings and trips" />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Bookings" value={stats.total} icon={Package} />
        <StatCard title="Active" value={stats.active} icon={Clock} />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} />
        <StatCard title="Cancelled" value={stats.cancelled} icon={XCircle} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={filtered}
            columns={columns}
            keyExtractor={(b) => b.id}
            searchKeys={["bookingRef", "itemName"]}
            actions={[
              { label: "View", icon: Eye, onClick: (b) => console.log("View", b) },
              { label: "Invoice", icon: Download, onClick: (b) => console.log("Invoice", b) },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
