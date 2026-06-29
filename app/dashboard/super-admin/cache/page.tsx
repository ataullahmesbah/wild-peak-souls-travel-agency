"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Cloud, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

export default function CachePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Cache Management" description="Manage system cache" />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Cloud className="h-5 w-5" />Cache Management</CardTitle></CardHeader>
        <CardContent>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Page Cache</p><p className="text-sm text-muted-foreground">456 MB</p></div><Button variant="outline" size="sm">Clear</Button></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">API Cache</p><p className="text-sm text-muted-foreground">123 MB</p></div><Button variant="outline" size="sm">Clear</Button></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Session Cache</p><p className="text-sm text-muted-foreground">34 MB</p></div><Button variant="outline" size="sm">Clear</Button></div>
            <Button><Cloud className="mr-2 h-4 w-4" />Clear All Cache</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
