import Link from 'next/link';
import { ArrowRight, MapPin, Calendar, TrendingUp, Star, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';
import { toursService } from '@/lib/services/tours.service';

export async function HomeTours() {
  const result = await toursService.getFeatured(6);
  const tours = result.success && result.data ? result.data : [];

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

        {tours.length === 0 ? (
          <Reveal delay={100}>
            <div className="text-center py-20">
              <Mountain className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No tours available yet. Check back soon.</p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {tours.map((tour, i) => (
              <Reveal key={tour.id} delay={i * 100}>
                <Card className="group h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={tour.coverUrl || 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={tour.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {tour.isFeatured && (
                      <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground shadow-md">Featured</Badge>
                    )}
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {tour.averageRating ?? 0}
                      <span className="text-white/60">({tour.reviewCount ?? 0})</span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {(tour as any).country?.name ?? 'Worldwide'}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug">{tour.title}</h3>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{tour.duration ?? 'Variable'}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />{tour.difficulty ?? 'Moderate'}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t border-border/60 p-5">
                    <div>
                      <span className="text-xs text-muted-foreground">From</span>
                      <div className="font-display text-xl font-bold text-primary">${tour.startingPrice ?? 'TBA'}</div>
                    </div>
                    <Button size="sm" asChild className="gap-1.5">
                      <Link href={`/tours/${tour.slug}`}>
                        Book Now <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
