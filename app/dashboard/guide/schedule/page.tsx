"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Calendar, Clock, Mountain, MapPin, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isGuide } from "@/lib/roles";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  type: string;
  location: string;
  participants: number;
  status: string;
}

const mockSchedule: ScheduleItem[] = [
  { id: "1", time: "06:00", title: "Morning Briefing", type: "meeting", location: "Hotel Lobby", participants: 8, status: "completed" },
  { id: "2", time: "07:00", title: "Trek Start - Day 1", type: "trek", location: "Nayapul", participants: 8, status: "completed" },
  { id: "3", time: "12:00", title: "Lunch Break", type: "break", location: "Tikhedhunga", participants: 8, status: "completed" },
  { id: "4", time: "14:00", title: "Continue Trek", type: "trek", location: "Ulleri", participants: 8, status: "upcoming" },
  { id: "5", time: "17:00", title: "Camp Arrival", type: "camp", location: "Ghorepani", participants: 8, status: "upcoming" },
];

export default function GuideSchedulePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";

  if (!isGuide(role)) redirect(getDashboardPathForRole(role));

  const [schedule] = useState<ScheduleItem[]>(mockSchedule);

  return (
    <div className="space-y-6">
      <PageHeader title="Daily Schedule" description="Your schedule for today" />
      <div className="space-y-3">
        {schedule.map((item, index) => (
          <div key={item.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-muted-foreground">{item.time}</span>
              <div className="mt-1 h-full w-px bg-border" />
            </div>
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge variant={item.status === "completed" ? "outline" : "default"} className={item.status === "completed" ? "text-muted-foreground" : "bg-green-100 text-green-800"}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{item.participants}</span>
                    </div>
                  </div>
                  {item.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
