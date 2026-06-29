"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Server, Eye, EyeOff, Copy, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";
import { useState } from "react";

export default function ApiSettingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [showKey, setShowKey] = useState(false);

  if (!isSuperAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="API Settings" description="Manage API credentials" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" />API Keys</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Public API Key</Label>
              <div className="flex gap-2">
                <Input type={showKey ? "text" : "password"} value="pk_live_xxxxxxxxxxxxxxxx" readOnly />
                <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                <Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secret Key (Hidden)</Label>
              <div className="flex gap-2">
                <Input type="password" value="sk_live_xxxxxxxxxxxxxxxx" readOnly />
                <Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Secret keys are never displayed in the browser for security.</p>
            </div>
            <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" />Regenerate Keys</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Webhook Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Webhook URL</Label><Input defaultValue="https://api.wildpeaksouls.com/webhooks" /></div>
            <div className="space-y-2"><Label>Webhook Secret</Label><Input type="password" value="whsec_xxxxxxxx" readOnly /></div>
            <Button>Save Webhook</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
