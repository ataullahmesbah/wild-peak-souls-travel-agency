"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Home, Plus, Pencil, Trash2, Eye, Layout } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface HomepageSection {
  id: string; name: string; type: string; status: string; order: number;
}

const mockSections: HomepageSection[] = [
  { id: "1", name: "Hero Banner", type: "hero", status: "active", order: 1 },
  { id: "2", name: "Featured Tours", type: "tours", status: "active", order: 2 },
  { id: "3", name: "Hot Deals", type: "deals", status: "active", order: 3 },
  { id: "4", name: "Testimonials", type: "reviews", status: "active", order: 4 },
  { id: "5", name: "Newsletter", type: "cta", status: "draft", order: 5 },
];

const columns: DataTableColumn<HomepageSection>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "type", title: "Type", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (s) => (
    <Badge variant={s.status === "active" ? "default" : "secondary"} className={s.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{s.status}</Badge>
  )},
  { key: "order", title: "Order", sortable: true },
];

export default function HomepagePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [sections, setSections] = useState<HomepageSection[]>(mockSections);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setSections(sections.filter((s) => !ids.includes(s.id)));
  const handleStatus = (ids: string[], status: string) => setSections(sections.map((s) => ids.includes(s.id) ? { ...s, status } : s));

  return (
    <div className="space-y-6">
      <PageHeader title="Homepage Sections" description="Manage homepage sections" action={<Button><Plus className="mr-2 h-4 w-4" />Add Section</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sections" value={sections.length} icon={Home} />
        <StatCard title="Active" value={sections.filter((s) => s.status === "active").length} icon={Eye} />
        <StatCard title="Drafts" value={sections.filter((s) => s.status === "draft").length} icon={Layout} />
        <StatCard title="Types" value={new Set(sections.map((s) => s.type)).size} icon={Home} />
      </div>
      <DataTable data={sections} columns={columns} keyExtractor={(s) => s.id} searchKeys={["name", "type", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (s) => console.log("Edit", s) }, { label: "Delete", icon: Trash2, onClick: (s) => handleDelete([s.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Activate", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
