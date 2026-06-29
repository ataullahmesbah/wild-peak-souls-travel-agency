"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Flame, Plus, Pencil, Trash2, Eye, Calendar } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

interface Event {
  id: string; title: string; location: string; date: string; status: string; participants: number; maxParticipants: number; type: string;
}

const mockEvents: Event[] = [
  { id: "1", title: "Everest Marathon", location: "Everest Region", date: "2025-05-29", status: "upcoming", participants: 120, maxParticipants: 200, type: "Marathon" },
  { id: "2", title: "Holi Festival Trek", location: "Kathmandu", date: "2025-03-14", status: "upcoming", participants: 45, maxParticipants: 50, type: "Festival" },
  { id: "3", title: "Yoga Retreat", location: "Pokhara", date: "2024-12-28", status: "completed", participants: 30, maxParticipants: 30, type: "Retreat" },
  { id: "4", title: "Photography Workshop", location: "Annapurna", date: "2025-02-15", status: "upcoming", participants: 18, maxParticipants: 25, type: "Workshop" },
];

const columns: DataTableColumn<Event>[] = [
  { key: "title", title: "Title", sortable: true },
  { key: "location", title: "Location", sortable: true },
  { key: "date", title: "Date", sortable: true },
  { key: "type", title: "Type", sortable: true },
  { key: "status", title: "Status", sortable: true, render: (e) => (
    <Badge variant={e.status === "upcoming" ? "default" : e.status === "ongoing" ? "secondary" : "outline"}
      className={e.status === "upcoming" ? "bg-green-100 text-green-800 hover:bg-green-100" : e.status === "ongoing" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
      {e.status}
    </Badge>
  )},
  { key: "participants", title: "Participants", sortable: true, render: (e) => `${e.participants}/${e.maxParticipants}` },
];

export default function EventsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [events, setEvents] = useState<Event[]>(mockEvents);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const handleDelete = (ids: string[]) => setEvents(events.filter((e) => !ids.includes(e.id)));
  const handleStatus = (ids: string[], status: string) => setEvents(events.map((e) => ids.includes(e.id) ? { ...e, status } : e));

  return (
    <div className="space-y-6">
      <PageHeader title="Events" description="Manage events and schedules" action={<Button><Plus className="mr-2 h-4 w-4" />Add Event</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={events.length} icon={Flame} />
        <StatCard title="Upcoming" value={events.filter((e) => e.status === "upcoming").length} icon={Calendar} />
        <StatCard title="Completed" value={events.filter((e) => e.status === "completed").length} icon={Eye} />
        <StatCard title="Total Participants" value={events.reduce((a, e) => a + e.participants, 0)} icon={Flame} />
      </div>
      <DataTable data={events} columns={columns} keyExtractor={(e) => e.id} searchKeys={["title", "location", "type", "status"]}
        statusFilter={{ key: "status", options: [{ label: "Upcoming", value: "upcoming" }, { label: "Ongoing", value: "ongoing" }, { label: "Completed", value: "completed" }] }}
        actions={[
          { label: "Edit", icon: Pencil, onClick: (e) => console.log("Edit", e) },
          { label: "Delete", icon: Trash2, onClick: (e) => handleDelete([e.id]), variant: "destructive" },
        ]}
        bulkActions={[
          { label: "Publish", icon: Eye, onClick: (ids) => handleStatus(ids, "upcoming") },
          { label: "Delete", icon: Trash2, onClick: handleDelete, variant: "destructive" },
        ]}
      />
    </div>
  );
}
