"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Package, MapPin, Calendar, Users, CreditCard, FileText, XCircle, ArrowLeft, CheckCircle, Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface BookingDetail {
  id: string;
  bookingRef: string;
  itemName: string;
  type: string;
  destination: string;
  date: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  participants: { name: string; type: string }[];
  specialRequests: string;
  invoiceNo: string;
}

const mockBooking: BookingDetail = {
  id: "1",
  bookingRef: "WPS-2024-ABC",
  itemName: "Annapurna Base Camp Trek",
  type: "tour",
  destination: "Annapurna Region, Nepal",
  date: "2024-12-25",
  status: "CONFIRMED",
  paymentStatus: "PAID",
  totalAmount: 1200,
  participants: [
    { name: "John Doe", type: "Adult" },
    { name: "Jane Doe", type: "Adult" },
  ],
  specialRequests: "Vegetarian meals only. Allergic to peanuts.",
  invoiceNo: "INV-2024-001",
};

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [booking] = useState<BookingDetail>(mockBooking);

  if (!session) redirect("/login?callbackUrl=/dashboard/bookings");

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Booking ${booking.bookingRef}`}
        description={booking.itemName}
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Status Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {booking.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={booking.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {booking.paymentStatus}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">${booking.totalAmount}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Item</span>
                <span className="font-medium">{booking.itemName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{booking.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {booking.destination}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {booking.date}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Participants</span>
                <span className="font-medium flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {booking.participants.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">${booking.totalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.participants.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.type}</p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
            {booking.specialRequests && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm font-medium text-yellow-800">Special Requests</p>
                <p className="text-sm text-yellow-700">{booking.specialRequests}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                Invoice
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              {booking.status !== "CANCELLED" && (
                <Button variant="destructive" className="flex-1">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
