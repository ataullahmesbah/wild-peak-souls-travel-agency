"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Settings, Globe, Mail, Bell, Shield, Palette } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

export default function SettingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System settings" />
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Site Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Site Name</Label><Input defaultValue="Wild Peak Souls" /></div>
              <div className="space-y-2"><Label>Site Email</Label><Input defaultValue="info@wildpeaksouls.com" /></div>
              <div className="space-y-2"><Label>Contact Phone</Label><Input defaultValue="+977-1-XXXXXXX" /></div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notification Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Email Notifications</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>Push Notifications</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>Booking Alerts</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>Review Alerts</Label><Switch /></div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Two-Factor Auth</Label><Switch /></div>
              <div className="flex items-center justify-between"><Label>Login Notifications</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>IP Restriction</Label><Switch /></div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Dark Mode</Label><Switch /></div>
              <div className="flex items-center justify-between"><Label>Compact Sidebar</Label><Switch /></div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
