'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Calendar, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';

const featuredTours = [
  { title: 'Everest Base Camp Trek', location: 'Khumbu, Nepal', duration: '14 days', difficulty: 'Challenging', price: '$2,499', rating: 4.9, reviews: 312, image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Best Seller' },
  { title: 'Torres del Paine Circuit', location: 'Patagonia, Chile', duration: '8 days', difficulty: 'Moderate', price: '$1,899', rating: 4.8, reviews: 198, image: 'https://images.pexels.com/photos/260457/pexels-photo-260457.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Featured' },
  { title: 'Matterhorn Summit Climb', location: 'Zermatt, Switzerland', duration: '5 days', difficulty: 'Extreme', price: '$3,299', rating: 5.0, reviews: 87, image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800', badge: 'Premium' },
];

export function HomeTours() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-mountain-50/40 to-background dark:from-mountain-900/10">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="Popular Tours"
              title="Adventures Worth Taking"
              description="Curated expeditions loved by thousands of travelers around the world."
              className="sm:max-w-xl"
            />
            <Button variant="outline" asChild className="gap-2 shrink-0">
              <Link href="/tours">All Tours <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredTours.map((tour, i) => (
            <Reveal key={tour.title} delay={i * 100}>
              <Card className="group h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={tour.image} alt={tour.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-primary text-primary-foreground shadow-md">{tour.badge}</Badge>
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {tour.rating}
                    <span className="text-white/60">({tour.reviews})</span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {tour.location}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug">{tour.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{tour.duration}</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />{tour.difficulty}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t border-border/60 p-5">
                  <div>
                    <span className="text-xs text-muted-foreground">From</span>
                    <div className="font-display text-xl font-bold text-primary">{tour.price}</div>
                  </div>
                  <Button size="sm" asChild className="gap-1.5">
                    <Link href={`/tours/${tour.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      Book Now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
