"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Ticket, Plus, Pencil, Trash2, Eye, Percent } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Coupon {
  id: string; code: string; discount: string; type: string; status: string; uses: number; maxUses: number;
}

const mockCoupons: Coupon[] = [
  { id: "1", code: "NEPAL20", discount: "20%", type: "percentage", status: "active", uses: 45, maxUses: 100 },
  { id: "2", code: "WELCOME50", discount: "$50", type: "fixed", status: "active", uses: 23, maxUses: 50 },
  { id: "3", code: "GROUP15", discount: "15%", type: "percentage", status: "draft", uses: 0, maxUses: 200 },
  { id: "4", code: "FLASH10", discount: "10%", type: "percentage", status: "expired", uses: 89, maxUses: 100 },
];

const columns: DataTableColumn<Coupon>[] = [
  { key: "code", title: "Code", sortable: true },
  { key: "discount", title: "Discount", sortable: true },
  { key: "type", title: "Type", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (c) => (
    <Badge variant={c.status === "active" ? "default" : c.status === "draft" ? "secondary" : "outline"}
      className={c.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : c.status === "draft" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>{c.status}</Badge>
  )},
  { key: "uses", title: "Uses", sortable: true, render: (c) => `${c.uses}/${c.maxUses}` },
];

export default function CouponsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setCoupons(coupons.filter((c) => !ids.includes(c.id)));
  const handleStatus = (ids: string[], status: string) => setCoupons(coupons.map((c) => ids.includes(c.id) ? { ...c, status } : c));

  return (
    <div className="space-y-6">
      <PageHeader title="Coupons" description="Manage discount coupons" action={<Button><Plus className="mr-2 h-4 w-4" />Add Coupon</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Coupons" value={coupons.length} icon={Ticket} />
        <StatCard title="Active" value={coupons.filter((c) => c.status === "active").length} icon={Eye} />
        <StatCard title="Drafts" value={coupons.filter((c) => c.status === "draft").length} icon={Percent} />
        <StatCard title="Total Uses" value={coupons.reduce((a, c) => a + c.uses, 0)} icon={Ticket} />
      </div>
      <DataTable data={coupons} columns={columns} keyExtractor={(c) => c.id} searchKeys={["code", "type", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }, { label: "Expired", value: "expired" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (c) => console.log("Edit", c) }, { label: "Delete", icon: Trash2, onClick: (c) => handleDelete([c.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Activate", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
