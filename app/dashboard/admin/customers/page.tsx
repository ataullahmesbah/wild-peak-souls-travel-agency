"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { UserCheck, Plus, Pencil, Trash2, Eye, Mail, Calendar } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Customer {
  id: string; name: string; email: string; bookings: number; spent: number; status: string; lastBooking: string;
}

const mockCustomers: Customer[] = [
  { id: "1", name: "John Doe", email: "john@example.com", bookings: 3, spent: 3200, status: "active", lastBooking: "2024-12-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", bookings: 5, spent: 6500, status: "active", lastBooking: "2024-12-10" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", bookings: 1, spent: 800, status: "inactive", lastBooking: "2024-11-20" },
  { id: "4", name: "Sarah Williams", email: "sarah@example.com", bookings: 2, spent: 1800, status: "active", lastBooking: "2024-12-05" },
];

const columns: DataTableColumn<Customer>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "email", title: "Email", sortable: true },
  { key: "bookings", title: "Bookings", sortable: true },
  { key: "spent", title: "Spent", sortable: true, render: (c) => `$${c.spent.toLocaleString()}` },
  { key: "status", title: "Status", sortable: true, render: (c) => (
    <Badge variant={c.status === "active" ? "default" : "secondary"} className={c.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>{c.status}</Badge>
  )},
  { key: "lastBooking", title: "Last Booking", sortable: true },
];

export default function CustomersPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setCustomers(customers.filter((c) => !ids.includes(c.id)));
  const handleStatus = (ids: string[], status: string) => setCustomers(customers.map((c) => ids.includes(c.id) ? { ...c, status } : c));

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage customers" action={<Button><Plus className="mr-2 h-4 w-4" />Add Customer</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Customers" value={customers.length} icon={UserCheck} />
        <StatCard title="Active" value={customers.filter((c) => c.status === "active").length} icon={Eye} />
        <StatCard title="Total Bookings" value={customers.reduce((a, c) => a + c.bookings, 0)} icon={Calendar} />
        <StatCard title="Total Revenue" value={`$${customers.reduce((a, c) => a + c.spent, 0).toLocaleString()}`} icon={Mail} />
      </div>
      <DataTable data={customers} columns={columns} keyExtractor={(c) => c.id} searchKeys={["name", "email", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (c) => console.log("Edit", c) }, { label: "Delete", icon: Trash2, onClick: (c) => handleDelete([c.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
