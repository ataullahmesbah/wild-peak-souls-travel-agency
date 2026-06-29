"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Image, Plus, Pencil, Trash2, Eye, Folder } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface GalleryItem {
  id: string; title: string; category: string; status: string; images: number;
}

const mockGallery: GalleryItem[] = [
  { id: "1", title: "Annapurna Gallery", category: "Mountains", status: "published", images: 24 },
  { id: "2", title: "Everest Views", category: "Mountains", status: "published", images: 18 },
  { id: "3", title: "Cultural Events", category: "Culture", status: "draft", images: 12 },
  { id: "4", title: "Wildlife Photos", category: "Nature", status: "published", images: 30 },
];

const columns: DataTableColumn<GalleryItem>[] = [
  { key: "title", title: "Title", sortable: true },
  { key: "category", title: "Category", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (g) => (
    <Badge variant={g.status === "published" ? "default" : "secondary"} className={g.status === "published" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>{g.status}</Badge>
  )},
  { key: "images", title: "Images", sortable: true },
];

export default function GalleryPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [gallery, setGallery] = useState<GalleryItem[]>(mockGallery);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setGallery(gallery.filter((g) => !ids.includes(g.id)));
  const handleStatus = (ids: string[], status: string) => setGallery(gallery.map((g) => ids.includes(g.id) ? { ...g, status } : g));

  return (
    <div className="space-y-6">
      <PageHeader title="Gallery" description="Manage photo galleries" action={<Button><Plus className="mr-2 h-4 w-4" />Add Gallery</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Galleries" value={gallery.length} icon={Image} />
        <StatCard title="Published" value={gallery.filter((g) => g.status === "published").length} icon={Eye} />
        <StatCard title="Drafts" value={gallery.filter((g) => g.status === "draft").length} icon={Pencil} />
        <StatCard title="Total Images" value={gallery.reduce((a, g) => a + g.images, 0)} icon={Folder} />
      </div>
      <DataTable data={gallery} columns={columns} keyExtractor={(g) => g.id} searchKeys={["title", "category", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }] }}
        actions={[{ label: "Edit", icon: Pencil, onClick: (g) => console.log("Edit", g) }, { label: "Delete", icon: Trash2, onClick: (g) => handleDelete([g.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Publish", icon: Eye, onClick: (ids) => handleStatus(ids, "published") }, { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
