import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Users, Clock, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';
import { eventService } from '@/lib/services/events.service';

export async function HomeEvents() {
  const result = await eventService.getFeatured(3);
  const events = result.success && result.data ? result.data : [];

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="Upcoming Events"
              title="Join an Adventure"
              description="Upcoming expeditions, camps, and gatherings you can be part of."
              className="sm:max-w-xl"
            />
            <Button variant="outline" asChild className="gap-2 shrink-0">
              <Link href="/events">All Events <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Reveal>

        {events.length === 0 ? (
          <Reveal delay={100}>
            <div className="text-center py-20">
              <Mountain className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No upcoming events. Check back soon.</p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {events.map((event, i) => (
              <Reveal key={event.id} delay={i * 100}>
                <Card className="group h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={event.coverUrl || 'https://images.pexels.com/photos/260457/pexels-photo-260457.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute left-3 top-3">
                      <Badge className="bg-ocean text-white shadow-md">{event.eventType}</Badge>
                    </div>
                    {event.isFeatured && (
                      <div className="absolute right-3 top-3">
                        <Badge className="bg-primary text-primary-foreground shadow-md">Featured</Badge>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="flex items-center gap-1.5 text-white/90 text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA'}
                          {event.endDate ? ` — ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-lg font-bold text-white">{event.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{(event as any).country?.name ?? 'Worldwide'}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.duration ?? event.durationDays ? `${event.durationDays} days` : 'Duration TBA'}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />
                        {event.availableSeats ?? event.maximumCapacity ? `${event.availableSeats ?? event.maximumCapacity} seats` : 'Limited seats'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="font-display text-xl font-bold text-primary">${event.startingPrice ?? event.pricePerPerson ?? 'TBA'}</div>
                      <Button size="sm" asChild className="gap-1">
                        <Link href={`/events/${event.slug}`}>
                          View Details <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
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
  );
}
