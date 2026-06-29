"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ToggleLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

export default function FeatureFlagsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Feature Flags" description="Manage feature flags" />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ToggleLeft className="h-5 w-5" />Feature Flags</CardTitle></CardHeader>
        <CardContent>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">New Booking Flow</p><p className="text-sm text-muted-foreground">Redesigned booking experience</p></div><Button variant="outline" size="sm">Enabled</Button></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Dark Mode</p><p className="text-sm text-muted-foreground">Dark theme support</p></div><Button variant="outline" size="sm">Enabled</Button></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Beta Reviews</p><p className="text-sm text-muted-foreground">New review system</p></div><Button variant="outline" size="sm">Disabled</Button></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
