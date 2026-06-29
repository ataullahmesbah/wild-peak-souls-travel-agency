"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Film, Upload, Trash2, Eye, Folder, Image, File } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface MediaItem {
  id: string; name: string; type: string; size: string; folder: string; uploadedAt: string;
}

const mockMedia: MediaItem[] = [
  { id: "1", name: "annapurna-hero.jpg", type: "image", size: "2.4 MB", folder: "Tours", uploadedAt: "2024-12-20" },
  { id: "2", name: "everest-summit.png", type: "image", size: "1.8 MB", folder: "Tours", uploadedAt: "2024-12-19" },
  { id: "3", name: "promo-video.mp4", type: "video", size: "45.2 MB", folder: "Videos", uploadedAt: "2024-12-18" },
  { id: "4", name: "brochure.pdf", type: "document", size: "3.1 MB", folder: "Documents", uploadedAt: "2024-12-17" },
];

const columns: DataTableColumn<MediaItem>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "type", title: "Type", sortable: true, render: (m) => (
    <Badge variant="outline" className={m.type === "image" ? "text-blue-600" : m.type === "video" ? "text-red-600" : "text-orange-600"}>{m.type}</Badge>
  )},
  { key: "size", title: "Size", sortable: true },
  { key: "folder", title: "Folder", sortable: true },
  { key: "uploadedAt", title: "Uploaded", sortable: true },
];

export default function MediaPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [media, setMedia] = useState<MediaItem[]>(mockMedia);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setMedia(media.filter((m) => !ids.includes(m.id)));

  return (
    <div className="space-y-6">
      <PageHeader title="Media Library" description="Manage media files" action={<Button><Upload className="mr-2 h-4 w-4" />Upload</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Files" value={media.length} icon={Film} />
        <StatCard title="Images" value={media.filter((m) => m.type === "image").length} icon={Image} />
        <StatCard title="Videos" value={media.filter((m) => m.type === "video").length} icon={Film} />
        <StatCard title="Folders" value={new Set(media.map((m) => m.folder)).size} icon={Folder} />
      </div>
      <DataTable data={media} columns={columns} keyExtractor={(m) => m.id} searchKeys={["name", "type", "folder"]}
        statusFilter={{ key: "type", options: [{ label: "Image", value: "image" }, { label: "Video", value: "video" }, { label: "Document", value: "document" }] }}
        actions={[{ label: "Delete", icon: Trash2, onClick: (m) => handleDelete([m.id]), variant: "destructive" }]}
        bulkActions={[{ label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" }]}
      />
    </div>
  );
}
