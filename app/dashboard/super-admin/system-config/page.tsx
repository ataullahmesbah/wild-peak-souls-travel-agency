"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Cpu, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

export default function SystemConfigPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="System Configuration" description="Configure system settings" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" />General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Max Upload Size (MB)</Label><Input type="number" defaultValue="10" /></div>
            <div className="space-y-2"><Label>Session Timeout (minutes)</Label><Input type="number" defaultValue="30" /></div>
            <div className="space-y-2"><Label>Max Login Attempts</Label><Input type="number" defaultValue="5" /></div>
            <div className="flex items-center justify-between"><Label>Enable Registration</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Enable Reviews</Label><Switch defaultChecked /></div>
            <Button><Save className="mr-2 h-4 w-4" />Save</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Mail Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>SMTP Host</Label><Input defaultValue="smtp.example.com" /></div>
            <div className="space-y-2"><Label>SMTP Port</Label><Input type="number" defaultValue="587" /></div>
            <div className="space-y-2"><Label>From Email</Label><Input defaultValue="noreply@wildpeaksouls.com" /></div>
            <Button><Save className="mr-2 h-4 w-4" />Save</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
