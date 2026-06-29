"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Users, Mail, Phone, MapPin, Star, Calendar } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isGuide } from "@/lib/roles";

interface GuideCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bookings: number;
  lastTour: string;
  rating: number;
}

const mockCustomers: GuideCustomer[] = [
  { id: "1", name: "John Doe", email: "john@example.com", phone: "+1 234 567 890", location: "USA", bookings: 2, lastTour: "2024-12-25", rating: 5 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "+1 234 567 891", location: "UK", bookings: 1, lastTour: "2025-01-15", rating: 4 },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", phone: "+1 234 567 892", location: "Canada", bookings: 3, lastTour: "2024-11-10", rating: 5 },
];

const columns: DataTableColumn<GuideCustomer>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "email", title: "Email", sortable: true },
  { key: "phone", title: "Phone", sortable: true },
  { key: "location", title: "Location", sortable: true },
  { key: "bookings", title: "Bookings", sortable: true },
  { key: "lastTour", title: "Last Tour", sortable: true },
  { key: "rating", title: "Rating", sortable: true },
];

export default function GuideCustomersPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [customers] = useState<GuideCustomer[]>(mockCustomers);

  if (!isGuide(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="My Customers" description="Customers who booked your tours" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Customers" value={customers.length} icon={Users} />
        <StatCard title="Repeat Guests" value={customers.filter((c) => c.bookings > 1).length} icon={Users} />
        <StatCard title="Avg Rating" value={(customers.reduce((a, c) => a + c.rating, 0) / customers.length).toFixed(1)} icon={Star} />
        <StatCard title="Total Bookings" value={customers.reduce((a, c) => a + c.bookings, 0)} icon={Calendar} />
      </div>
      <DataTable data={customers} columns={columns} keyExtractor={(c) => c.id} searchKeys={["name", "email", "location"]} />
    </div>
  );
}
