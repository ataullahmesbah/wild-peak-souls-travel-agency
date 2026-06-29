"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Activity, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

export default function ActivityLogsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Activity Logs" description="View system activity logs" />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Activity Logs</CardTitle></CardHeader>
        <CardContent>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">2024-12-21 14:30:00</span><span>User login: john@example.com</span><Badge>Info</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">2024-12-21 14:25:00</span><span>Tour updated: Annapurna Base Camp</span><Badge>Update</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">2024-12-21 14:20:00</span><span>Booking created: #12345</span><Badge>Create</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">2024-12-21 14:15:00</span><span>User deleted: mike@example.com</span><Badge variant="destructive">Delete</Badge></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
