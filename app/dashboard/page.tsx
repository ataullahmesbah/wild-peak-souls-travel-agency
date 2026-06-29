"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Calendar,
  Mountain,
  Flame,
  Star,
  Clock,
  TrendingUp,
  Package,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { getDashboardPathForRole } from "@/config/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const role = session?.user?.role || "customer";

  if (role !== "customer" && role !== "guest") {
    const path = getDashboardPathForRole(role);
    redirect(path);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name || "Traveler"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is what is happening with your travel plans.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Bookings"
          value="3"
          icon={Package}
          description="Active bookings"
        />
        <StatCard
          title="Upcoming Tours"
          value="2"
          icon={Mountain}
          description="Starting this month"
        />
        <StatCard
          title="Upcoming Events"
          value="1"
          icon={Flame}
          description="Registered events"
        />
        <StatCard
          title="My Reviews"
          value="5"
          icon={Star}
          description="Reviews submitted"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mountain className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Annapurna Base Camp Trek</p>
                <p className="text-sm text-muted-foreground">Dec 15, 2024</p>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                Confirmed
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mountain className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Everest Base Camp</p>
                <p className="text-sm text-muted-foreground">Jan 20, 2025</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                Pending
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/tours">
                <Mountain className="mr-2 h-4 w-4" />
                Browse Tours
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/events">
                <Flame className="mr-2 h-4 w-4" />
                Browse Events
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                View My Bookings
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/profile">
                <TrendingUp className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
