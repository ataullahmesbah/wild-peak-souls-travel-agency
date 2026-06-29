"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FileText, Download, CreditCard, Calendar, CheckCircle, XCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  invoiceNo: string;
  bookingRef: string;
  date: string;
  amount: number;
  status: string;
  paidAt: string;
}

const mockInvoices: Invoice[] = [
  { id: "1", invoiceNo: "INV-2024-001", bookingRef: "WPS-2024-ABC", date: "2024-12-20", amount: 1200, status: "paid", paidAt: "2024-12-20" },
  { id: "2", invoiceNo: "INV-2024-002", bookingRef: "WPS-2024-DEF", date: "2024-12-19", amount: 250, status: "pending", paidAt: "" },
  { id: "3", invoiceNo: "INV-2024-003", bookingRef: "WPS-2024-GHI", date: "2024-11-15", amount: 800, status: "paid", paidAt: "2024-11-15" },
];

const columns: DataTableColumn<Invoice>[] = [
  { key: "invoiceNo", title: "Invoice #", sortable: true },
  { key: "bookingRef", title: "Booking Ref", sortable: true },
  { key: "date", title: "Date", sortable: true },
  { key: "amount", title: "Amount", sortable: true, render: (i) => `$${i.amount}` },
  { key: "status", title: "Status", sortable: true, render: (i) => (
    <Badge variant={i.status === "paid" ? "default" : "secondary"} className={i.status === "paid" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{i.status}</Badge>
  )},
  { key: "paidAt", title: "Paid At", sortable: true },
];

export default function InvoicesPage() {
  const { data: session } = useSession();
  const [invoices] = useState<Invoice[]>(mockInvoices);

  if (!session) redirect("/login?callbackUrl=/dashboard/invoices");

  return (
    <div className="space-y-6">
      <PageHeader title="My Invoices" description="View and download your invoices" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Invoices" value={invoices.length} icon={FileText} />
        <StatCard title="Paid" value={invoices.filter((i) => i.status === "paid").length} icon={CheckCircle} />
        <StatCard title="Pending" value={invoices.filter((i) => i.status === "pending").length} icon={XCircle} />
        <StatCard title="Total Paid" value={`$${invoices.filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0)}`} icon={CreditCard} />
      </div>
      <DataTable
        data={invoices}
        columns={columns}
        keyExtractor={(i) => i.id}
        searchKeys={["invoiceNo", "bookingRef"]}
        actions={[{ label: "Download", icon: Download, onClick: (i) => console.log("Download", i) }]}
      />
    </div>
  );
}
