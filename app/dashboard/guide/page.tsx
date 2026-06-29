"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Mountain, Calendar, Star, BookOpen } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isGuide } from "@/lib/roles";

export default function GuideDashboard() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isGuide(role)) {
    redirect(getDashboardPathForRole(role));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guide Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {session?.user?.name || "Guide"}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Tours" value={8} icon={Mountain} description="Assigned tours" />
        <StatCard title="My Events" value={3} icon={Calendar} description="Assigned events" />
        <StatCard title="Total Bookings" value={45} icon={BookOpen} description="For my tours" />
        <StatCard title="Rating" value={4.8} icon={Star} description="Average rating" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Upcoming Tours</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Annapurna Base Camp</p><p className="text-sm text-muted-foreground">Dec 25, 2024</p></div><Badge className="bg-green-100 text-green-800">Confirmed</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Everest Base Camp</p><p className="text-sm text-muted-foreground">Jan 15, 2025</p></div><Badge className="bg-yellow-100 text-yellow-800">Pending</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start"><a href="/dashboard/guide/tours"><Mountain className="mr-2 h-4 w-4" />My Tours</a></Button>
            <Button asChild variant="outline" className="w-full justify-start"><a href="/dashboard/guide/events"><Calendar className="mr-2 h-4 w-4" />My Events</a></Button>
            <Button asChild variant="outline" className="w-full justify-start"><a href="/dashboard/guide/bookings"><BookOpen className="mr-2 h-4 w-4" />Bookings</a></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
