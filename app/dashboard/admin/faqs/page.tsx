"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { HelpCircle, Plus, Pencil, Trash2, Eye, FileText } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface FAQ {
  id: string; question: string; category: string; status: string; order: number;
}

const mockFAQs: FAQ[] = [
  { id: "1", question: "What is the best time to visit Nepal?", category: "General", status: "active", order: 1 },
  { id: "2", question: "Do I need a visa for Nepal?", category: "General", status: "active", order: 2 },
  { id: "3", question: "What is the difficulty level of ABC trek?", category: "Trekking", status: "active", order: 3 },
  { id: "4", question: "Are permits required for Everest?", category: "Permits", status: "draft", order: 4 },
];

const columns: DataTableColumn<FAQ>[] = [
  { key: "question", title: "Question", sortable: true },
  { key: "category", title: "Category", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (f) => (
    <Badge variant={f.status === "active" ? "default" : "secondary"} className={f.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{f.status}</Badge>
  )},
  { key: "order", title: "Order", sortable: true },
];

export default function FAQsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [faqs, setFaqs] = useState<FAQ[]>(mockFAQs);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setFaqs(faqs.filter((f) => !ids.includes(f.id)));
  const handleStatus = (ids: string[], status: string) => setFaqs(faqs.map((f) => ids.includes(f.id) ? { ...f, status } : f));

  return (
    <div className="space-y-6">
      <PageHeader title="FAQs" description="Manage frequently asked questions" action={<Button><Plus className="mr-2 h-4 w-4" />Add FAQ</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total FAQs" value={faqs.length} icon={HelpCircle} />
        <StatCard title="Active" value={faqs.filter((f) => f.status === "active").length} icon={Eye} />
        <StatCard title="Drafts" value={faqs.filter((f) => f.status === "draft").length} icon={FileText} />
        <StatCard title="Categories" value={new Set(faqs.map((f) => f.category)).size} icon={HelpCircle} />
      </div>
      <DataTable data={faqs} columns={columns} keyExtractor={(f) => f.id} searchKeys={["question", "category", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (f) => console.log("Edit", f) }, { label: "Delete", icon: Trash2, onClick: (f) => handleDelete([f.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Activate", icon: Eye, onClick: (ids) => handleStatus(ids, "active") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
