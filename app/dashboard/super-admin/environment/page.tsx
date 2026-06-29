"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Database, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

export default function EnvironmentPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Environment Configuration" description="View system environment variables (secrets hidden)" />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Environment Variables</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">NODE_ENV</span><Badge>production</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">DATABASE_URL</span><div className="flex items-center gap-2"><span className="text-muted-foreground">****</span><AlertTriangle className="h-4 w-4 text-yellow-500" /></div></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">NEXTAUTH_SECRET</span><div className="flex items-center gap-2"><span className="text-muted-foreground">****</span><AlertTriangle className="h-4 w-4 text-yellow-500" /></div></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">NEXTAUTH_URL</span><Badge variant="outline">https://wildpeaksouls.com</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">CLOUDINARY_CLOUD_NAME</span><Badge variant="outline">wild-peak-souls</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="font-mono text-sm">GOOGLE_CLIENT_ID</span><div className="flex items-center gap-2"><span className="text-muted-foreground">****</span><AlertTriangle className="h-4 w-4 text-yellow-500" /></div></div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Sensitive values are hidden for security. Values with **** are secrets and never exposed in the UI.</p>
        </CardContent>
      </Card>
    </div>
  );
}
