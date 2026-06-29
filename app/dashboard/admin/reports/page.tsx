"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { BarChart3, Download, TrendingUp, Users, DollarSign, Calendar, Mountain } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

export default function ReportsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="View reports and analytics" action={<Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Report</Button>} />
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" value="1,248" icon={Users} trend={{ value: 12, label: "from last month", positive: true }} />
            <StatCard title="Total Bookings" value="456" icon={Calendar} trend={{ value: 15, label: "from last month", positive: true }} />
            <StatCard title="Revenue" value="$245,000" icon={DollarSign} trend={{ value: 22, label: "from last month", positive: true }} />
            <StatCard title="Active Tours" value="28" icon={Mountain} trend={{ value: 5, label: "from last month", positive: true }} />
          </div>
          <Card>
            <CardHeader><CardTitle>Monthly Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><span className="text-sm">January</span><div className="flex items-center gap-2"><div className="h-2 w-48 rounded-full bg-muted"><div className="h-2 w-[60%] rounded-full bg-primary" /></div><span className="text-sm font-medium">$45,000</span></div></div>
                <div className="flex items-center justify-between"><span className="text-sm">February</span><div className="flex items-center gap-2"><div className="h-2 w-48 rounded-full bg-muted"><div className="h-2 w-[75%] rounded-full bg-primary" /></div><span className="text-sm font-medium">$56,000</span></div></div>
                <div className="flex items-center justify-between"><span className="text-sm">March</span><div className="flex items-center gap-2"><div className="h-2 w-48 rounded-full bg-muted"><div className="h-2 w-[90%] rounded-full bg-primary" /></div><span className="text-sm font-medium">$68,000</span></div></div>
                <div className="flex items-center justify-between"><span className="text-sm">April</span><div className="flex items-center gap-2"><div className="h-2 w-48 rounded-full bg-muted"><div className="h-2 w-[80%] rounded-full bg-primary" /></div><span className="text-sm font-medium">$60,000</span></div></div>
                <div className="flex items-center justify-between"><span className="text-sm">May</span><div className="flex items-center gap-2"><div className="h-2 w-48 rounded-full bg-muted"><div className="h-2 w-[100%] rounded-full bg-primary" /></div><span className="text-sm font-medium">$75,000</span></div></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bookings" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Confirmed" value="389" icon={TrendingUp} />
            <StatCard title="Pending" value="23" icon={Calendar} />
            <StatCard title="Cancelled" value="12" icon={TrendingUp} />
          </div>
        </TabsContent>
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Tour Revenue" value="$180,000" icon={Mountain} />
            <StatCard title="Event Revenue" value="$45,000" icon={Calendar} />
            <StatCard title="Other Revenue" value="$20,000" icon={DollarSign} />
          </div>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="New Users" value="156" icon={Users} />
            <StatCard title="Active Users" value="892" icon={TrendingUp} />
            <StatCard title="Returning Users" value="456" icon={Users} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
