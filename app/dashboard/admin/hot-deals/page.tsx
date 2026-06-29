"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Flame, Plus, Pencil, Trash2, Eye, Tag } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface HotDeal {
  id: string; title: string; discount: string; validUntil: string; status: string; used: number;
}

const mockDeals: HotDeal[] = [
  { id: "1", title: "Winter Special - 20% Off", discount: "20%", validUntil: "2025-01-31", status: "active", used: 45 },
  { id: "2", title: "New Year Deal - Free Gear", discount: "Free Gear", validUntil: "2025-01-15", status: "active", used: 23 },
  { id: "3", title: "Group Discount - 15%", discount: "15%", validUntil: "2025-03-31", status: "draft", used: 0 },
  { id: "4", title: "Early Bird - 10%", discount: "10%", validUntil: "2024-12-31", status: "expired", used: 67 },
];

const columns: DataTableColumn<HotDeal>[] = [
  { key: "title", title: "Title", sortable: true },
  { key: "discount", title: "Discount", sortable: true },
  { key: "validUntil", title: "Valid Until", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (d) => (
    <Badge variant={d.status === "active" ? "default" : d.status === "draft" ? "secondary" : "outline"}
      className={d.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : d.status === "draft" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>{d.status}</Badge>
  )},
  { key: "used", title: "Used", sortable: true },
];

export default function HotDealsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [deals, setDeals] = useState<HotDeal[]>(mockDeals);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setDeals(deals.filter((d) => !ids.includes(d.id)));
  const handleStatus = (ids: string[], status: string) => setDeals(deals.map((d) => ids.includes(d.id) ? { ...d, status } : d));

  return (
    <div className="space-y-6">
      <PageHeader title="Hot Deals" description="Manage hot deals" action={<Button><Plus className="mr-2 h-4 w-4" />Add Deal</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Deals" value={deals.length} icon={Flame} />
        <StatCard title="Active" value={deals.filter((d) => d.status === "active").length} icon={Eye} />
        <StatCard title="Drafts" value={deals.filter((d) => d.status === "draft").length} icon={Tag} />
        <StatCard title="Total Used" value={deals.reduce((a, d) => a + d.used, 0)} icon={Flame} />
      </div>
      <DataTable data={deals} columns={columns} keyExtractor={(d) => d.id} searchKeys={["title", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }, { label: "Expired", value: "expired" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (d) => console.log("Edit", d) }, { label: "Delete", icon: Trash2, onClick: (d) => handleDelete([d.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Activate", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
