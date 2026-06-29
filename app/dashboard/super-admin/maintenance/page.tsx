"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Wrench, AlertTriangle, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

export default function MaintenancePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance Mode" description="Manage maintenance mode settings" />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Maintenance Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium">Enable Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">This will make the site unavailable to all users except Super Admins.</p>
              </div>
            </div>
            <Switch />
          </div>
          <div className="space-y-2"><Label>Maintenance Message</Label><Textarea defaultValue="We are performing scheduled maintenance. Please check back later." rows={4} /></div>
          <div className="space-y-2"><Label>Allowed IPs (comma separated)</Label><Textarea defaultValue="127.0.0.1" rows={2} /></div>
          <Button><Save className="mr-2 h-4 w-4" />Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
