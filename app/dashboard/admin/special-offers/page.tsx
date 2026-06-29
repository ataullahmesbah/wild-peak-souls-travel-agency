"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Tag, Plus, Pencil, Trash2, Eye, Gift } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface SpecialOffer {
  id: string; title: string; type: string; validUntil: string; status: string; claims: number;
}

const mockOffers: SpecialOffer[] = [
  { id: "1", title: "Free Airport Transfer", type: "Service", validUntil: "2025-03-31", status: "active", claims: 34 },
  { id: "2", title: "Complimentary Guide", type: "Guide", validUntil: "2025-02-28", status: "active", claims: 12 },
  { id: "3", title: "Hotel Upgrade", type: "Accommodation", validUntil: "2025-01-31", status: "draft", claims: 0 },
  { id: "4", title: "Meal Package", type: "Food", validUntil: "2024-12-31", status: "expired", claims: 56 },
];

const columns: DataTableColumn<SpecialOffer>[] = [
  { key: "title", title: "Title", sortable: true },
  { key: "type", title: "Type", sortable: true },
  { key: "validUntil", title: "Valid Until", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (o) => (
    <Badge variant={o.status === "active" ? "default" : o.status === "draft" ? "secondary" : "outline"}
      className={o.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : o.status === "draft" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>{o.status}</Badge>
  )},
  { key: "claims", title: "Claims", sortable: true },
];

export default function SpecialOffersPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [offers, setOffers] = useState<SpecialOffer[]>(mockOffers);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setOffers(offers.filter((o) => !ids.includes(o.id)));
  const handleStatus = (ids: string[], status: string) => setOffers(offers.map((o) => ids.includes(o.id) ? { ...o, status } : o));

  return (
    <div className="space-y-6">
      <PageHeader title="Special Offers" description="Manage special offers" action={<Button><Plus className="mr-2 h-4 w-4" />Add Offer</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Offers" value={offers.length} icon={Tag} />
        <StatCard title="Active" value={offers.filter((o) => o.status === "active").length} icon={Eye} />
        <StatCard title="Drafts" value={offers.filter((o) => o.status === "draft").length} icon={Gift} />
        <StatCard title="Total Claims" value={offers.reduce((a, o) => a + o.claims, 0)} icon={Tag} />
      </div>
      <DataTable data={offers} columns={columns} keyExtractor={(o) => o.id} searchKeys={["title", "type", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }, { label: "Expired", value: "expired" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (o) => console.log("Edit", o) }, { label: "Delete", icon: Trash2, onClick: (o) => handleDelete([o.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Activate", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
