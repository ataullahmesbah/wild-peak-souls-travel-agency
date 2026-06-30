"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus, Pencil, Trash2, Eye, FileText, AlertTriangle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";
import { useAdminData } from "@/hooks/use-admin-data";
import { adminDelete, adminBulkDelete, adminBulkUpdate } from "@/app/actions/admin";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: { name: string } | null;
  status: string;
  viewCount: number;
  publishedAt: Date | null;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function BlogsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const {
    data: blogs,
    total,
    loading,
    error,
    refresh,
    load,
  } = useAdminData<Blog>({ model: "blogs", page: 1, limit: 20 });

  const handleDelete = async (id: string) => {
    const result = await adminDelete("blogs", id);
    if (result.success) {
      refresh();
    } else {
      alert(result.error || "Failed to delete blog");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    const result = await adminBulkDelete("blogs", ids);
    if (result.success) {
      refresh();
    } else {
      alert(result.error || "Failed to delete blogs");
    }
  };

  const handleBulkStatus = async (ids: string[], status: string) => {
    const result = await adminBulkUpdate("blogs", ids, { status });
    if (result.success) {
      refresh();
    } else {
      alert(result.error || "Failed to update status");
    }
  };

  const columns: DataTableColumn<Blog>[] = [
    { key: "title", title: "Title", sortable: true },
    { key: "category", title: "Category", sortable: true, render: (b) => b.category?.name ?? "—" },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (b) => (
        <Badge
          variant={b.status === "PUBLISHED" ? "default" : "secondary"}
          className={b.status === "PUBLISHED" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}
        >
          {b.status}
        </Badge>
      ),
    },
    { key: "viewCount", title: "Views", sortable: true },
    {
      key: "publishedAt",
      title: "Published",
      sortable: true,
      render: (b) => b.publishedAt ? new Date(b.publishedAt).toLocaleDateString("en-US") : "—",
    },
    {
      key: "featured",
      title: "Featured",
      render: (b) => (
        <Badge variant={b.isFeatured ? "default" : "outline"}>
          {b.isFeatured ? "Featured" : "—"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      sortable: true,
      render: (b) => new Date(b.createdAt).toLocaleDateString("en-US"),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blogs" description="Manage blog posts" />
        <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blogs"
        description="Manage blog posts"
        action={
          <Button asChild>
            <Link href="/dashboard/admin/blogs/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Blog
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Blogs" value={total} icon={BookOpen} />
        <StatCard title="Published" value={blogs.filter((b) => b.status === "PUBLISHED").length} icon={Eye} />
        <StatCard title="Drafts" value={blogs.filter((b) => b.status === "DRAFT").length} icon={FileText} />
        <StatCard title="Total Views" value={blogs.reduce((a, b) => a + b.viewCount, 0)} icon={BookOpen} />
      </div>
      <DataTable
        data={blogs}
        columns={columns}
        keyExtractor={(b) => b.id}
        searchKeys={["title", "slug", "status"]}
        statusFilter={{
          key: "status",
          options: [
            { label: "Published", value: "PUBLISHED" },
            { label: "Draft", value: "DRAFT" },
          ],
        }}
        actions={[
          { label: "Edit", icon: Pencil, onClick: (b) => console.log("Edit", b.id) },
          { label: "Delete", icon: Trash2, onClick: (b) => handleDelete(b.id), variant: "destructive" },
        ]}
        bulkActions={[
          { label: "Publish", icon: Eye, onClick: (ids) => handleBulkStatus(ids, "PUBLISHED") },
          { label: "Unpublish", icon: FileText, onClick: (ids) => handleBulkStatus(ids, "DRAFT") },
          { label: "Delete", icon: Trash2, onClick: handleBulkDelete, variant: "destructive" },
        ]}
      />
      {loading && blogs.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-muted-foreground">Loading blogs...</span>
        </div>
      )}
    </div>
  );
}
