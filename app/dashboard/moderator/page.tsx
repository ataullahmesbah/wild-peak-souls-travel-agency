"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { LayoutDashboard, Star, BookOpen, Users, Flag, Eye, CheckCircle, XCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isModerator } from "@/lib/roles";

export default function ModeratorDashboard() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isModerator(role)) {
    redirect(getDashboardPathForRole(role));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderator Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {session?.user?.name || "Moderator"}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Reviews" value={12} icon={Star} description="Need moderation" />
        <StatCard title="Pending Blogs" value={5} icon={BookOpen} description="Need approval" />
        <StatCard title="User Reports" value={3} icon={Flag} description="To review" />
        <StatCard title="Approved Today" value={8} icon={CheckCircle} description="Items approved" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Pending Moderation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Review: Annapurna Trek</p><p className="text-sm text-muted-foreground">By John Doe</p></div><div className="flex gap-2"><Button size="sm" variant="outline"><CheckCircle className="h-4 w-4" /></Button><Button size="sm" variant="outline"><XCircle className="h-4 w-4" /></Button></div></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">Blog: Everest Guide</p><p className="text-sm text-muted-foreground">By Jane Smith</p></div><div className="flex gap-2"><Button size="sm" variant="outline"><CheckCircle className="h-4 w-4" /></Button><Button size="sm" variant="outline"><XCircle className="h-4 w-4" /></Button></div></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start"><a href="/dashboard/moderator/reviews"><Star className="mr-2 h-4 w-4" />Review Moderation</a></Button>
            <Button asChild variant="outline" className="w-full justify-start"><a href="/dashboard/moderator/blogs"><BookOpen className="mr-2 h-4 w-4" />Blog Moderation</a></Button>
            <Button asChild variant="outline" className="w-full justify-start"><a href="/dashboard/moderator/users"><Users className="mr-2 h-4 w-4" />User Moderation</a></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
