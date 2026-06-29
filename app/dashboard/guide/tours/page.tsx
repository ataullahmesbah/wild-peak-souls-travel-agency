"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Mountain, Users, Calendar, Star, CheckCircle, Clock } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isGuide } from "@/lib/roles";

interface GuideTour {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  status: string;
  rating: number;
}

const mockTours: GuideTour[] = [
  { id: "1", title: "Annapurna Base Camp Trek", destination: "Annapurna", startDate: "2024-12-25", endDate: "2025-01-01", participants: 8, maxParticipants: 12, status: "upcoming", rating: 4.8 },
  { id: "2", title: "Everest Base Camp Trek", destination: "Everest", startDate: "2025-01-15", endDate: "2025-01-29", participants: 6, maxParticipants: 10, status: "upcoming", rating: 4.9 },
  { id: "3", title: "Langtang Valley Trek", destination: "Langtang", startDate: "2024-11-10", endDate: "2024-11-15", participants: 5, maxParticipants: 8, status: "completed", rating: 4.7 },
];

const columns: DataTableColumn<GuideTour>[] = [
  { key: "title", title: "Tour", sortable: true },
  { key: "destination", title: "Destination", sortable: true },
  { key: "startDate", title: "Start", sortable: true },
  { key: "participants", title: "Participants", sortable: true, render: (t) => `${t.participants}/${t.maxParticipants}` },
  { key: "status", title: "Status", sortable: true, render: (t) => (
    <Badge variant={t.status === "upcoming" ? "default" : "secondary"} className={t.status === "upcoming" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>{t.status}</Badge>
  )},
  { key: "rating", title: "Rating", sortable: true },
];

export default function GuideToursPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [tours] = useState<GuideTour[]>(mockTours);

  if (!isGuide(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="My Tours" description="Tours assigned to you" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tours" value={tours.length} icon={Mountain} />
        <StatCard title="Upcoming" value={tours.filter((t) => t.status === "upcoming").length} icon={Calendar} />
        <StatCard title="Completed" value={tours.filter((t) => t.status === "completed").length} icon={CheckCircle} />
        <StatCard title="Total Guests" value={tours.reduce((a, t) => a + t.participants, 0)} icon={Users} />
      </div>
      <DataTable data={tours} columns={columns} keyExtractor={(t) => t.id} searchKeys={["title", "destination"]} />
    </div>
  );
}
