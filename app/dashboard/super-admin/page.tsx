"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Shield, Server, Database, Cpu, Wrench, Lock, Eye, Activity, FileText, Archive, Cloud, ToggleLeft, Users, CheckCircle, AlertTriangle, XCircle, TrendingUp, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isSuperAdmin } from "@/lib/roles";

const systemStats = {
  cpu: 42, memory: 68, disk: 45, uptime: "99.9%",
  activeUsers: 234, totalRequests: 45678, errorRate: 0.02,
  lastBackup: "2024-12-20 03:00", nextBackup: "2024-12-21 03:00",
};

const recentActivity = [
  { id: "1", user: "Admin John", action: "Updated API keys", time: "5 min ago", type: "security" },
  { id: "2", user: "System", action: "Automated backup completed", time: "1 hour ago", type: "system" },
  { id: "3", user: "Super Admin", action: "Created new admin user", time: "2 hours ago", type: "user" },
  { id: "4", user: "System", action: "Cache cleared", time: "3 hours ago", type: "system" },
];

export default function SuperAdminDashboard() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isSuperAdmin(role)) {
    redirect(getDashboardPathForRole(role));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System overview and management</p>
        </div>
        <Badge variant="default" className="bg-destructive text-destructive-foreground">
          <Shield className="mr-1 h-4 w-4" />
          Super Admin
        </Badge>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="CPU Usage" value={`${systemStats.cpu}%`} icon={Cpu} trend={{ value: -5, label: "from last hour", positive: true }} />
        <StatCard title="Memory Usage" value={`${systemStats.memory}%`} icon={Database} trend={{ value: 2, label: "from last hour", positive: false }} />
        <StatCard title="Disk Usage" value={`${systemStats.disk}%`} icon={Archive} trend={{ value: 1, label: "from last week", positive: false }} />
        <StatCard title="Uptime" value={systemStats.uptime} icon={CheckCircle} />
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Resource Usage</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span>CPU</span><span className="font-medium">{systemStats.cpu}%</span></div>
                  <Progress value={systemStats.cpu} className={systemStats.cpu > 80 ? "text-destructive" : ""} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span>Memory</span><span className="font-medium">{systemStats.memory}%</span></div>
                  <Progress value={systemStats.memory} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span>Disk</span><span className="font-medium">{systemStats.disk}%</span></div>
                  <Progress value={systemStats.disk} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>System Info</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Active Users</span><span className="font-medium">{systemStats.activeUsers}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total Requests</span><span className="font-medium">{systemStats.totalRequests.toLocaleString()}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Error Rate</span><span className="font-medium">{systemStats.errorRate}%</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Last Backup</span><span className="font-medium">{systemStats.lastBackup}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Next Backup</span><span className="font-medium">{systemStats.nextBackup}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        activity.type === "security" ? "bg-red-100 text-red-600" :
                        activity.type === "system" ? "bg-blue-100 text-blue-600" :
                        "bg-green-100 text-green-600"
                      }`}>
                        {activity.type === "security" ? <Lock className="h-4 w-4" /> :
                         activity.type === "system" ? <Server className="h-4 w-4" /> :
                         <Users className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">by {activity.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Failed Logins</CardTitle><AlertTriangle className="h-5 w-5 text-yellow-500" /></CardHeader>
              <CardContent><div className="text-3xl font-bold">3</div><p className="text-sm text-muted-foreground">Last 24 hours</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Blocked IPs</CardTitle><Shield className="h-5 w-5 text-green-500" /></CardHeader>
              <CardContent><div className="text-3xl font-bold">0</div><p className="text-sm text-muted-foreground">Currently blocked</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Security Score</CardTitle><CheckCircle className="h-5 w-5 text-green-500" /></CardHeader>
              <CardContent><div className="text-3xl font-bold">98%</div><p className="text-sm text-muted-foreground">System security rating</p></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader><CardTitle>Super Admin Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="justify-start"><a href="/dashboard/super-admin/api-settings"><Server className="mr-2 h-4 w-4" />API Settings</a></Button>
            <Button asChild variant="outline" className="justify-start"><a href="/dashboard/super-admin/system-config"><Cpu className="mr-2 h-4 w-4" />System Config</a></Button>
            <Button asChild variant="outline" className="justify-start"><a href="/dashboard/super-admin/roles"><Shield className="mr-2 h-4 w-4" />Roles</a></Button>
            <Button asChild variant="outline" className="justify-start"><a href="/dashboard/super-admin/activity-logs"><Activity className="mr-2 h-4 w-4" />Activity Logs</a></Button>
            <Button asChild variant="outline" className="justify-start"><a href="/dashboard/super-admin/audit-logs"><FileText className="mr-2 h-4 w-4" />Audit Logs</a></Button>
            <Button asChild variant="outline" className="justify-start"><a href="/dashboard/super-admin/backups"><Archive className="mr-2 h-4 w-4" />Backups</a></Button>
            <Button asChild variant="outline" className="justify-start"><a href="/dashboard/super-admin/cache"><Cloud className="mr-2 h-4 w-4" />Cache</a></Button>
            <Button asChild variant="outline" className="justify-start"><a href="/dashboard/super-admin/feature-flags"><ToggleLeft className="mr-2 h-4 w-4" />Feature Flags</a></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
