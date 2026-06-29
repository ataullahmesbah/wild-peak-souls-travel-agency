"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Calendar, Users, CheckCircle, Clock, Flame, MapPin } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isGuide } from "@/lib/roles";

interface GuideEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  participants: number;
  maxParticipants: number;
  status: string;
}

const mockEvents: GuideEvent[] = [
  { id: "1", title: "Everest Marathon", location: "Everest Region", date: "2025-05-29", participants: 120, maxParticipants: 200, status: "upcoming" },
  { id: "2", title: "Holi Festival Trek", location: "Kathmandu", date: "2025-03-14", participants: 45, maxParticipants: 50, status: "upcoming" },
  { id: "3", title: "Photography Workshop", location: "Annapurna", date: "2025-02-15", participants: 18, maxParticipants: 25, status: "upcoming" },
];

const columns: DataTableColumn<GuideEvent>[] = [
  { key: "title", title: "Event", sortable: true },
  { key: "location", title: "Location", sortable: true },
  { key: "date", title: "Date", sortable: true },
  { key: "participants", title: "Participants", sortable: true, render: (e) => `${e.participants}/${e.maxParticipants}` },
  { key: "status", title: "Status", sortable: true, render: (e) => (
    <Badge variant={e.status === "upcoming" ? "default" : "secondary"} className={e.status === "upcoming" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>{e.status}</Badge>
  )},
];

export default function GuideEventsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [events] = useState<GuideEvent[]>(mockEvents);

  if (!isGuide(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="My Events" description="Events assigned to you" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={events.length} icon={Calendar} />
        <StatCard title="Upcoming" value={events.filter((e) => e.status === "upcoming").length} icon={Clock} />
        <StatCard title="Completed" value={events.filter((e) => e.status === "completed").length} icon={CheckCircle} />
        <StatCard title="Total Guests" value={events.reduce((a, e) => a + e.participants, 0)} icon={Users} />
      </div>
      <DataTable data={events} columns={columns} keyExtractor={(e) => e.id} searchKeys={["title", "location"]} />
    </div>
  );
}
