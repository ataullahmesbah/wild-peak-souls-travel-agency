"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

export default function SecurityPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Security Center" description="Security settings and monitoring" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Security Score</CardTitle><Shield className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">98%</div><p className="text-xs text-muted-foreground">Excellent</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Failed Logins</CardTitle><AlertTriangle className="h-4 w-4 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">3</div><p className="text-xs text-muted-foreground">Last 24h</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Blocked IPs</CardTitle><XCircle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">0</div><p className="text-xs text-muted-foreground">Currently</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Sessions</CardTitle><Eye className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">234</div><p className="text-xs text-muted-foreground">Now</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3"><div className="flex items-center gap-3"><Lock className="h-5 w-5" /><div><p className="font-medium">Two-Factor Authentication</p><p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p></div></div><Badge variant="outline">Disabled</Badge></div>
          <div className="flex items-center justify-between rounded-lg border p-3"><div className="flex items-center gap-3"><Shield className="h-5 w-5" /><div><p className="font-medium">IP Whitelist</p><p className="text-sm text-muted-foreground">Restrict admin access by IP</p></div></div><Badge variant="outline">Disabled</Badge></div>
          <div className="flex items-center justify-between rounded-lg border p-3"><div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5" /><div><p className="font-medium">Brute Force Protection</p><p className="text-sm text-muted-foreground">Auto-block after 5 failed attempts</p></div></div><Badge>Enabled</Badge></div>
        </CardContent>
      </Card>
    </div>
  );
}
