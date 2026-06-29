"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Users,
  Calendar,
  Mountain,
  MapPin,
  Flame,
  Star,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Package,
  BookOpen,
  MessageSquare,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

const mockData = {
  stats: {
    totalUsers: 1248,
    totalCustomers: 892,
    totalGuides: 34,
    totalBookings: 456,
    upcomingEvents: 12,
    activeTours: 28,
    revenue: 245000,
    pendingBookings: 23,
    completedBookings: 389,
  },
  recentBookings: [
    { id: "1", customer: "John Doe", tour: "Annapurna Base Camp", date: "2024-12-15", status: "confirmed", amount: 1200 },
    { id: "2", customer: "Jane Smith", tour: "Everest Base Camp", date: "2025-01-20", status: "pending", amount: 2500 },
    { id: "3", customer: "Mike Johnson", tour: "Langtang Valley", date: "2024-12-10", status: "completed", amount: 800 },
    { id: "4", customer: "Sarah Williams", tour: "Manaslu Circuit", date: "2025-02-01", status: "confirmed", amount: 1800 },
  ],
  recentUsers: [
    { id: "1", name: "John Doe", email: "john@example.com", role: "customer", joined: "2024-12-01" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "guide", joined: "2024-11-28" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", role: "customer", joined: "2024-11-25" },
    { id: "4", name: "Sarah Williams", email: "sarah@example.com", role: "customer", joined: "2024-11-20" },
  ],
  topTours: [
    { name: "Annapurna Base Camp", bookings: 145, revenue: 174000 },
    { name: "Everest Base Camp", bookings: 98, revenue: 245000 },
    { name: "Langtang Valley", bookings: 76, revenue: 60800 },
    { name: "Manaslu Circuit", bookings: 54, revenue: 97200 },
  ],
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isAdmin(role)) {
    redirect(getDashboardPathForRole(role));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your travel business performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={mockData.stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: 12, label: "from last month", positive: true }}
        />
        <StatCard
          title="Total Customers"
          value={mockData.stats.totalCustomers.toLocaleString()}
          icon={Users}
          trend={{ value: 8, label: "from last month", positive: true }}
        />
        <StatCard
          title="Travel Guides"
          value={mockData.stats.totalGuides}
          icon={Activity}
          trend={{ value: 3, label: "from last month", positive: true }}
        />
        <StatCard
          title="Total Bookings"
          value={mockData.stats.totalBookings}
          icon={Package}
          trend={{ value: 15, label: "from last month", positive: true }}
        />
        <StatCard
          title="Upcoming Events"
          value={mockData.stats.upcomingEvents}
          icon={Calendar}
          description="Events this month"
        />
        <StatCard
          title="Active Tours"
          value={mockData.stats.activeTours}
          icon={Mountain}
          description="Currently running"
        />
        <StatCard
          title="Revenue"
          value={`$${mockData.stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 22, label: "from last month", positive: true }}
        />
        <StatCard
          title="Pending Bookings"
          value={mockData.stats.pendingBookings}
          icon={Clock}
          description="Requires action"
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/admin/bookings">View All</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{booking.customer}</p>
                      <p className="text-xs text-muted-foreground">{booking.tour}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${booking.amount}</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Tours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Performing Tours</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/admin/tours">View All</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.topTours.map((tour, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{tour.name}</span>
                    <span className="text-muted-foreground">
                      {tour.bookings} bookings
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(tour.bookings / 150) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-20 text-right">
                      ${(tour.revenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users & Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/admin/users">View All</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "guide"
                          ? "bg-ocean-100 text-ocean-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.role}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.joined}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/admin/bookings">
                <Package className="mr-2 h-4 w-4" />
                Manage Bookings
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/admin/tours">
                <Mountain className="mr-2 h-4 w-4" />
                Manage Tours
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/admin/events">
                <Flame className="mr-2 h-4 w-4" />
                Manage Events
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/dashboard/admin/reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
