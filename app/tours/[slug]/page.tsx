import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, TrendingUp, Star, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';
import { toursService } from '@/lib/services/tours.service';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await toursService.getBySlug(params.slug);
  const tour = result.success && result.data ? result.data : null;
  return {
    title: tour ? `${tour.title} — Tours` : 'Tour — Wild Peak Souls',
    description: tour?.shortDescription ?? 'Explore this guided tour with Wild Peak Souls.',
    openGraph: {
      title: tour?.title ?? undefined,
      description: tour?.shortDescription ?? undefined,
      images: tour?.coverUrl ? [{ url: tour.coverUrl }] : undefined,
    },
  };
}

export default async function TourDetailPage({ params }: { params: { slug: string } }) {
  const result = await toursService.getBySlug(params.slug);
  if (!result.success || !result.data) return notFound();
  const tour = result.data;

  return (
    <>
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <img src={tour.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920'} alt={tour.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        <Container className="relative z-10 flex h-full flex-col justify-end pb-12">
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{tour.title}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{(tour as { country?: { name?: string } }).country?.name ?? 'Worldwide'}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{tour.duration ?? 'Variable'}</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" />{tour.difficulty ?? 'Moderate'}</span>
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{tour.averageRating ?? 0} ({tour.reviewCount ?? 1} reviews)</span>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="text-lg leading-relaxed text-foreground/80">{tour.description ?? tour.shortDescription}</div>
            </Reveal>

            {tour.highlights && tour.highlights.length > 0 && (
              <Reveal delay={100}>
                <div className="mt-12">
                  <h3 className="font-display text-xl font-semibold">Highlights</h3>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {tour.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        <span className="text-sm text-foreground/80">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {tour.includedItems && tour.includedItems.length > 0 && (
                <Reveal delay={150}>
                  <div>
                    <h3 className="font-display text-xl font-semibold">Included</h3>
                    <div className="mt-4 space-y-2">
                      {tour.includedItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                          <span className="text-sm text-foreground/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
              {tour.excludedItems && tour.excludedItems.length > 0 && (
                <Reveal delay={200}>
                  <div>
                    <h3 className="font-display text-xl font-semibold">Not Included</h3>
                    <div className="mt-4 space-y-2">
                      {tour.excludedItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                          <span className="text-sm text-foreground/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>

            {/* Pricing & CTA */}
            <Reveal delay={300}>
              <div className="mt-12 rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <span className="text-sm text-muted-foreground">Starting from</span>
                    <div className="font-display text-3xl font-bold text-primary">${tour.startingPrice ?? 'TBA'}</div>
                    <span className="text-sm text-muted-foreground">per person</span>
                  </div>
                  <div className="flex gap-3">
                    <Button size="lg" asChild className="gap-2">
                      <Link href="/book">
                        Book This Tour
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
