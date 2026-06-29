"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Archive, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

export default function BackupsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Backup Management" description="Manage system backups" />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Archive className="h-5 w-5" />Backup Management</CardTitle></CardHeader>
        <CardContent>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Full Backup - 2024-12-21</p><p className="text-sm text-muted-foreground">Database + Files</p></div><div className="flex items-center gap-2"><Badge className="bg-green-100 text-green-800">Success</Badge><Button variant="outline" size="sm">Restore</Button></div></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Database Backup - 2024-12-20</p><p className="text-sm text-muted-foreground">Database only</p></div><div className="flex items-center gap-2"><Badge className="bg-green-100 text-green-800">Success</Badge><Button variant="outline" size="sm">Restore</Button></div></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Files Backup - 2024-12-19</p><p className="text-sm text-muted-foreground">Media files</p></div><div className="flex items-center gap-2"><Badge className="bg-green-100 text-green-800">Success</Badge><Button variant="outline" size="sm">Restore</Button></div></div>
            <Button><Archive className="mr-2 h-4 w-4" />Create Backup</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
