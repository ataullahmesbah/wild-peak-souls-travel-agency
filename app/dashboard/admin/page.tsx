"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Users,
  Calendar,
  Mountain,
  MapPin,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";
import { adminStats } from "@/app/actions/admin";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
  tours: number;
  events: number;
  destinations: number;
  bookings: number;
  customers: number;
  blogs: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  useEffect(() => {
    adminStats().then((result) => {
      if (result.success) {
        setStats(result.data as AdminStats);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your adventure business performance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Published Tours"
              value={stats?.tours ?? 0}
              icon={Mountain}
              description="Active tours on the website"
            />
            <StatCard
              title="Published Events"
              value={stats?.events ?? 0}
              icon={Calendar}
              description="Active events on the website"
            />
            <StatCard
              title="Destinations"
              value={stats?.destinations ?? 0}
              icon={MapPin}
              description="Active destinations"
            />
            <StatCard
              title="Total Bookings"
              value={stats?.bookings ?? 0}
              icon={Package}
              description="All booking records"
            />
            <StatCard
              title="Customers"
              value={stats?.customers ?? 0}
              icon={Users}
              description="Registered customers"
            />
            <StatCard
              title="Published Blogs"
              value={stats?.blogs ?? 0}
              icon={BookOpen}
              description="Active articles"
            />
            <StatCard
              title="Total Content"
              value={(stats?.tours ?? 0) + (stats?.events ?? 0) + (stats?.destinations ?? 0) + (stats?.blogs ?? 0)}
              icon={TrendingUp}
              description="All public content"
            />
            <StatCard
              title="Revenue Ready"
              value={stats?.bookings ?? 0}
              icon={DollarSign}
              description="Bookings processed"
            />
          </>
        )}
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Travel Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickLink href="/dashboard/admin/tours" label="Tours" icon={Mountain} count={stats?.tours} />
            <QuickLink href="/dashboard/admin/events" label="Events" icon={Calendar} count={stats?.events} />
            <QuickLink href="/dashboard/admin/destinations" label="Destinations" icon={MapPin} count={stats?.destinations} />
            <QuickLink href="/dashboard/admin/countries" label="Countries" icon={MapPin} />
            <QuickLink href="/dashboard/admin/cities" label="Cities" icon={MapPin} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content & Marketing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickLink href="/dashboard/admin/blogs" label="Blogs" icon={BookOpen} count={stats?.blogs} />
            <QuickLink href="/dashboard/admin/hot-deals" label="Hot Deals" icon={TrendingUp} />
            <QuickLink href="/dashboard/admin/special-offers" label="Special Offers" icon={TrendingUp} />
            <QuickLink href="/dashboard/admin/homepage" label="Homepage" icon={Mountain} />
            <QuickLink href="/dashboard/admin/coupons" label="Coupons" icon={DollarSign} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickLink href="/dashboard/admin/bookings" label="Bookings" icon={Package} count={stats?.bookings} />
            <QuickLink href="/dashboard/admin/users" label="Users" icon={Users} />
            <QuickLink href="/dashboard/admin/customers" label="Customers" icon={Users} />
            <QuickLink href="/dashboard/admin/reviews" label="Reviews" icon={TrendingUp} />
            <QuickLink href="/dashboard/admin/reports" label="Reports" icon={TrendingUp} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({ href, label, icon: Icon, count }: { href: string; label: string; icon: any; count?: number }) {
  return (
    <Button variant="ghost" className="w-full justify-between" asChild>
      <a href={href}>
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </span>
        <span className="flex items-center gap-2">
          {count !== undefined && (
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              {count}
            </Badge>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </span>
      </a>
    </Button>
  );
}
