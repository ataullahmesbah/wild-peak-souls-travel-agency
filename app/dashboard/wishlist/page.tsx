"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Heart, Trash2, MapPin, Mountain, Calendar, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface WishlistItem {
  id: string;
  name: string;
  type: string;
  location: string;
  image: string;
  price: number;
  addedAt: string;
}

const mockWishlist: WishlistItem[] = [
  { id: "1", name: "Annapurna Base Camp Trek", type: "tour", location: "Annapurna, Nepal", image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg", price: 1200, addedAt: "2024-12-20" },
  { id: "2", name: "Everest Base Camp Trek", type: "tour", location: "Everest, Nepal", image: "https://images.pexels.com/photos/2908773/pexels-photo-2908773.jpeg", price: 2500, addedAt: "2024-12-18" },
  { id: "3", name: "Everest Marathon", type: "event", location: "Everest Region", image: "https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg", price: 250, addedAt: "2024-12-15" },
];

export default function WishlistPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<WishlistItem[]>(mockWishlist);

  if (!session) redirect("/login?callbackUrl=/dashboard/wishlist");

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-6">
      <PageHeader title="My Wishlist" description={`${items.length} items saved`} />
      
      {items.length === 1 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Your wishlist is empty</h3>
          <p className="text-muted-foreground mt-1">Save tours and events you love to book later.</p>
          <Button asChild className="mt-4">
            <Link href="/tours">Browse Tours</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  {item.type === "tour" ? <Mountain className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                  <span className="capitalize">{item.type}</span>
                </div>
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold">${item.price}</span>
                  <Button size="sm" asChild>
                    <Link href={`/${item.type}s/${item.id}`}>
                      Book Now <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
