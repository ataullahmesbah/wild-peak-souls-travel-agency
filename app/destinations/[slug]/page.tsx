import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ArrowRight, TrendingUp, Mountain, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';
import { destinationsService } from '@/lib/services/destinations.service';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await destinationsService.getBySlug(params.slug);
  const dest = result.success && result.data ? result.data : null;
  return {
    title: dest ? `${dest.title} — Destinations` : 'Destination — Wild Peak Souls',
    description: dest?.shortDescription ?? 'Explore this breathtaking destination with Wild Peak Souls.',
    openGraph: {
      title: dest?.title ?? undefined,
      description: dest?.shortDescription ?? undefined,
      images: dest?.coverUrl ? [{ url: dest.coverUrl }] : undefined,
    },
  };
}

export default async function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const result = await destinationsService.getBySlug(params.slug);
  if (!result.success || !result.data) return notFound();
  const dest = result.data;

  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={dest.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920'}
          alt={dest.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        <Container className="relative z-10 flex h-full flex-col justify-end pb-16">
          <div className="flex items-center gap-1.5 text-white/80">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">
              {(dest as { country?: { name?: string } }).country?.name ?? 'Worldwide'}
            </span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            {dest.title}
          </h1>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                {dest.altitude && <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" />Altitude: {dest.altitude}</span>}
                {dest.bestSeason && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Best Season: {dest.bestSeason}</span>}
                {dest.climate && <span className="flex items-center gap-1"><Mountain className="h-4 w-4" />Climate: {dest.climate}</span>}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-8 text-lg leading-relaxed text-foreground/80">
                {dest.description ?? dest.shortDescription}
              </div>
            </Reveal>

            {/* Gallery */}
            {dest.galleryUrls && dest.galleryUrls.length > 0 && (
              <Reveal delay={200}>
                <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {dest.galleryUrls.map((url, i) => (
                    <div key={i} className="overflow-hidden rounded-xl">
                      <img src={url} alt={`${dest.title} ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Map */}
            {dest.googleMapUrl && (
              <Reveal delay={300}>
                <div className="mt-12">
                  <h3 className="font-display text-xl font-semibold">Location</h3>
                  <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
                    <iframe
                      src={dest.googleMapUrl}
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </Reveal>
            )}

            {/* CTA */}
            <Reveal delay={400}>
              <div className="mt-12 flex gap-3">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/tours">
                    Explore Tours
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/events">View Events</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
