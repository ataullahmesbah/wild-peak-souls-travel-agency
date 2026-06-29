"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FileText, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="View audit trail" />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Audit Logs</CardTitle></CardHeader>
        <CardContent>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">2024-12-21 14:30:00</span><span>Admin updated API keys</span><Badge>Security</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">2024-12-21 14:00:00</span><span>Role permissions modified</span><Badge>Security</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">2024-12-21 13:30:00</span><span>System config changed</span><Badge>Config</Badge></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
