"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { BookOpen, Plus, Pencil, Trash2, Eye, FileText } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Blog {
  id: string; title: string; author: string; category: string; status: string; views: number; publishedAt: string;
}

const mockBlogs: Blog[] = [
  { id: "1", title: "Best Treks in Nepal", author: "Admin", category: "Trekking", status: "published", views: 1200, publishedAt: "2024-11-15" },
  { id: "2", title: "Everest Base Camp Guide", author: "Guide Mike", category: "Guides", status: "published", views: 850, publishedAt: "2024-11-20" },
  { id: "3", title: "Packing for Himalayas", author: "Admin", category: "Tips", status: "draft", views: 0, publishedAt: "" },
  { id: "4", title: "Annapurna vs Everest", author: "Jane Smith", category: "Comparison", status: "published", views: 640, publishedAt: "2024-12-01" },
];

const columns: DataTableColumn<Blog>[] = [
  { key: "title", title: "Title", sortable: true },
  { key: "author", title: "Author", sortable: true },
  { key: "category", title: "Category", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (b) => (
    <Badge variant={b.status === "published" ? "default" : "secondary"} className={b.status === "published" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{b.status}</Badge>
  )},
  { key: "views", title: "Views", sortable: true },
  { key: "publishedAt", title: "Published", sortable: true },
];

export default function BlogsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [blogs, setBlogs] = useState<Blog[]>(mockBlogs);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setBlogs(blogs.filter((b) => !ids.includes(b.id)));
  const handleStatus = (ids: string[], status: string) => setBlogs(blogs.map((b) => ids.includes(b.id) ? { ...b, status } : b));

  return (
    <div className="space-y-6">
      <PageHeader title="Blogs" description="Manage blog posts" action={<Button><Plus className="mr-2 h-4 w-4" />Add Blog</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Blogs" value={blogs.length} icon={BookOpen} />
        <StatCard title="Published" value={blogs.filter((b) => b.status === "published").length} icon={Eye} />
        <StatCard title="Drafts" value={blogs.filter((b) => b.status === "draft").length} icon={FileText} />
        <StatCard title="Total Views" value={blogs.reduce((a, b) => a + b.views, 0).toLocaleString()} icon={BookOpen} />
      </div>
      <DataTable data={blogs} columns={columns} keyExtractor={(b) => b.id} searchKeys={["title", "author", "category", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (b) => console.log("Edit", b) }, { label: "Delete", icon: Trash2, onClick: (b) => handleDelete([b.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Publish", icon: Eye, onClick: (ids) => handleStatus(ids, "published") }, { label: "Unpublish", icon: FileText, onClick: (ids) => handleStatus(ids, "draft") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
