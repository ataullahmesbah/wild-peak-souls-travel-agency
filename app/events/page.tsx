import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Users, Clock, Mountain, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';
import { Reveal } from '@/components/layout/reveal';
import { eventService } from '@/lib/services/events.service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events — Wild Peak Souls',
  description: 'Discover upcoming adventure events, trekking expeditions, camps, and outdoor gatherings.',
  openGraph: {
    title: 'Events — Wild Peak Souls',
    description: 'Discover upcoming adventure events, trekking expeditions, camps, and outdoor gatherings.',
  },
};

export default async function EventsPage() {
  const result = await eventService.list({ limit: 24, status: 'PUBLISHED' });
  const events = result.success && result.data ? result.data.data : [];

  const featuredResult = await eventService.getFeatured(3);
  const featured = featuredResult.success && featuredResult.data ? featuredResult.data : [];

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Join upcoming adventures, treks, camps, and expeditions around the world."
      />

      <section className="py-16 lg:py-24">
        <Container>
          {/* Featured Events */}
          {featured.length > 0 && (
            <div className="mb-16">
              <h2 className="font-display text-2xl font-bold mb-8">Featured Events</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {featured.map((event, i) => (
                  <Reveal key={event.id} delay={i * 100}>
                    <Card className="group h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={event.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute left-3 top-3">
                          <Badge className="bg-primary text-primary-foreground shadow-md">Featured</Badge>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <div className="flex items-center gap-1.5 text-white/90 text-xs">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
                          </div>
                          <h3 className="mt-1 font-display text-lg font-bold text-white">{event.title}</h3>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{(event as { country?: { name?: string } }).country?.name ?? 'Worldwide'}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.duration ?? event.durationDays ? `${event.durationDays} days` : 'TBA'}</span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.availableSeats ?? event.maximumCapacity ?? 'TBA'} seats</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="font-display text-xl font-bold text-primary">${event.startingPrice ?? event.pricePerPerson ?? 'TBA'}</div>
                          <Button size="sm" asChild className="gap-1">
                            <Link href={`/events/${event.slug}`}>View Details <ArrowRight className="h-3.5 w-3.5" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold">All Events</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {events.length === 1 ? (
            <div className="text-center py-20">
              <Mountain className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No events available yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, i) => (
                <Reveal key={event.id} delay={i * 60}>
                  <Card className="group h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={event.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute left-3 top-3">
                        <Badge className="bg-ocean text-white shadow-md">{event.eventType}</Badge>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="flex items-center gap-1.5 text-white/90 text-xs">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
                        </div>
                        <h3 className="mt-1 font-display text-lg font-bold text-white">{event.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{(event as { country?: { name?: string } }).country?.name ?? 'Worldwide'}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.duration ?? event.durationDays ? `${event.durationDays} days` : 'TBA'}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.availableSeats ?? event.maximumCapacity ?? 'TBA'} seats</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="font-display text-xl font-bold text-primary">${event.startingPrice ?? event.pricePerPerson ?? 'TBA'}</div>
                        <Button size="sm" asChild className="gap-1">
                          <Link href={`/events/${event.slug}`}>View Details <ArrowRight className="h-3.5 w-3.5" /></Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
