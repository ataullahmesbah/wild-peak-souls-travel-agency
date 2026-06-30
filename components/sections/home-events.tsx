'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';

const upcomingEvents = [
  { title: 'Himalayan Photography Expedition', date: 'Jul 15 – Jul 22, 2026', location: 'Nepal', duration: '7 days', seats: 12, total: 20, price: '$1,499', image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Photography', featured: true },
  { title: 'Patagonia Wilderness Trek', date: 'Aug 5 – Aug 14, 2026', location: 'Argentina', duration: '9 days', seats: 8, total: 16, price: '$2,199', image: 'https://images.pexels.com/photos/260457/pexels-photo-260457.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Trekking', featured: false },
  { title: 'Swiss Alps Camping Festival', date: 'Sep 1 – Sep 5, 2026', location: 'Switzerland', duration: '5 days', seats: 25, total: 40, price: '$899', image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Camping', featured: false },
];

export function HomeEvents() {
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
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {upcomingEvents.map((event, i) => (
            <Reveal key={event.title} delay={i * 100}>
              <Card className="group h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                {/* Image */}
                  <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-ocean text-white shadow-md">{event.type}</Badge>
                  </div>
                  {event.featured && (
                    <div className="absolute right-3 top-3">
                      <Badge className="bg-primary text-primary-foreground shadow-md">Featured</Badge>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex items-center gap-1.5 text-white/90 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{event.date}</span>
                    </div>
                    <h3 className="mt-1 font-display text-lg font-bold text-white">{event.title}</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.seats}/{event.total} seats</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="font-display text-xl font-bold text-primary">{event.price}</div>
                    <Button size="sm" asChild className="gap-1">
                      <Link href={`/events/${event.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        View Details <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
