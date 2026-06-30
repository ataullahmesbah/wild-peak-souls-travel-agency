import Link from 'next/link';
import { ArrowRight, MapPin, TrendingUp, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';
import { destinationsService } from '@/lib/services/destinations.service';

export async function HomeDestinations() {
  const result = await destinationsService.getFeatured(8);
  const destinations = result.success && result.data ? result.data : [];

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="Top Destinations"
              title="Iconic Peaks & Trails"
              description="Hand-picked destinations that define the adventure travel experience."
              className="sm:max-w-xl"
            />
            <Button variant="outline" asChild className="gap-2 shrink-0">
              <Link href="/destinations">View All <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Reveal>

        {destinations.length === 0 ? (
          <Reveal delay={100}>
            <div className="text-center py-20">
              <Mountain className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No destinations available yet. Check back soon.</p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((dest, i) => (
              <Reveal key={dest.id} delay={i * 80}>
                <Link href={`/destinations/${dest.slug}`} className="group block h-full">
                  <Card className="h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={dest.coverUrl || 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={dest.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="flex items-center gap-1.5 text-white/80">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">{(dest as any).country?.name ?? 'Worldwide'}</span>
                        </div>
                        <h3 className="mt-1 font-display text-xl font-bold text-white">{dest.title}</h3>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-white/70">
                            {dest.altitude && (
                              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{dest.altitude}</span>
                            )}
                            <span className="flex items-center gap-1"><Mountain className="h-3 w-3" />{dest.climate ?? 'Alpine'}</span>
                          </div>
                          <Badge variant="secondary" className="bg-white/15 text-white backdrop-blur-md">
                            {(dest as any)._count?.tours ?? 0} tours
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
