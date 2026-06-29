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

export default function HealthPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="System Health" description="Monitor system health" />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />System Health</CardTitle></CardHeader>
        <CardContent>
          
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span>Database</span><Badge className="bg-green-100 text-green-800">Healthy</Badge></div><div className="h-2 rounded-full bg-muted"><div className="h-2 w-[95%] rounded-full bg-green-500"/></div></div>
            <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span>API Server</span><Badge className="bg-green-100 text-green-800">Healthy</Badge></div><div className="h-2 rounded-full bg-muted"><div className="h-2 w-[98%] rounded-full bg-green-500"/></div></div>
            <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span>CDN</span><Badge className="bg-green-100 text-green-800">Healthy</Badge></div><div className="h-2 rounded-full bg-muted"><div className="h-2 w-[100%] rounded-full bg-green-500"/></div></div>
            <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span>Email Service</span><Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge></div><div className="h-2 rounded-full bg-muted"><div className="h-2 w-[75%] rounded-full bg-yellow-500"/></div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
