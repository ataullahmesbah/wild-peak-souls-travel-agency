import Link from 'next/link';
import { ArrowRight, Calendar, Tag, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';
import { Reveal } from '@/components/layout/reveal';
import { specialOfferService } from '@/lib/services/cms.service';
import { toursService } from '@/lib/services/tours.service';
import { eventService } from '@/lib/services/events.service';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await specialOfferService.getBySlug(params.slug);
  if (!result.success || !result.data) {
    return { title: 'Offer Not Found — Wild Peak Souls' };
  }
  const offer = result.data;
  return {
    title: `${offer.title} — Special Offer — Wild Peak Souls`,
    description: offer.subtitle || offer.description || 'Special adventure offer',
    openGraph: {
      title: offer.title,
      description: offer.subtitle || '',
      images: offer.coverUrl ? [offer.coverUrl] : [],
    },
  };
}

export default async function OfferDetailPage({ params }: Props) {
  const result = await specialOfferService.getBySlug(params.slug);
  if (!result.success || !result.data) {
    notFound();
  }

  const offer = result.data;

  const [toursResult, eventsResult] = await Promise.all([
    toursService.getFeatured(3),
    eventService.getFeatured(3),
  ]);

  const relatedTours = toursResult.success && toursResult.data ? toursResult.data : [];
  const relatedEvents = eventsResult.success && eventsResult.data ? eventsResult.data : [];

  const endDate = offer.endsAt ? new Date(offer.endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Limited Time';
  const startDate = offer.startsAt ? new Date(offer.startsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Now';

  const savings = offer.originalPrice && offer.discountedPrice ? offer.originalPrice - offer.discountedPrice : 0;
  const discountPercent = offer.discountPercent || (offer.originalPrice && offer.discountedPrice ? Math.round((1 - offer.discountedPrice / offer.originalPrice) * 100) : 0);

  return (
    <>
      <PageHeader
        title={offer.title}
        subtitle={offer.subtitle || 'Special offer'}
      />

      <section className="py-12 lg:py-16">
        <Container>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Reveal>
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src={offer.coverUrl || 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                    alt={offer.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <Badge className="bg-ocean text-white gap-1">
                      <Sparkles className="h-3 w-3" />
                      {offer.badgeText || 'Special Offer'}
                    </Badge>
                  </div>
                  {discountPercent > 0 && (
                    <div className="absolute right-4 top-4">
                      <Badge className="bg-white/90 text-foreground">
                        {discountPercent}% OFF
                      </Badge>
                    </div>
                  )}
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="mt-8">
                  <h1 className="font-display text-3xl font-bold">{offer.title}</h1>
                  {offer.subtitle && (
                    <p className="mt-2 text-lg text-muted-foreground">{offer.subtitle}</p>
                  )}
                </div>
              </Reveal>

              <Reveal delay={150}>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Valid: {startDate} — {endDate}</span>
                  </div>
                  {offer.currency && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span>Currency: {offer.currency}</span>
                    </div>
                  )}
                </div>
              </Reveal>

              {offer.description && (
                <Reveal delay={200}>
                  <div className="mt-8 prose dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed">{offer.description}</p>
                  </div>
                </Reveal>
              )}

              {/* Pricing */}
              <Reveal delay={250}>
                <Card className="mt-8 border-border/60">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Offer Price</p>
                        <div className="flex items-baseline gap-3 mt-1">
                          <span className="font-display text-3xl font-bold text-primary">
                            ${offer.discountedPrice}
                          </span>
                          {offer.originalPrice && (
                            <span className="text-lg text-muted-foreground line-through">
                              ${offer.originalPrice}
                            </span>
                          )}
                        </div>
                        {savings > 0 && (
                          <Badge variant="outline" className="mt-2 border-green-200 text-green-600">
                            You save ${savings}
                          </Badge>
                        )}
                      </div>
                      <Button size="lg" className="gap-2" asChild>
                        <Link href={offer.ctaUrl || offer.externalUrl || '/tours'}>
                          {offer.ctaText || 'View Offer'} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Reveal delay={100}>
                <Card className="border-border/60">
                  <CardContent className="p-6">
                    <h3 className="font-semibold">Offer Details</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="font-medium">${offer.originalPrice || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Offer Price</span>
                        <span className="font-medium text-primary">${offer.discountedPrice || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-ocean">{discountPercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid From</span>
                        <span className="font-medium">{startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires</span>
                        <span className="font-medium">{endDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Quick Links */}
              <Reveal delay={200}>
                <Card className="border-border/60">
                  <CardContent className="p-6">
                    <h3 className="font-semibold">Explore More</h3>
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <Link href="/tours"><ArrowRight className="h-4 w-4" /> All Tours</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <Link href="/events"><ArrowRight className="h-4 w-4" /> All Events</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <Link href="/destinations"><ArrowRight className="h-4 w-4" /> Destinations</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>

          {/* Related Content */}
          {(relatedTours.length > 0 || relatedEvents.length > 0) && (
            <Reveal delay={300}>
              <div className="mt-16">
                <h2 className="font-display text-2xl font-bold">You Might Also Like</h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedTours.map((tour) => (
                    <Card key={tour.id} className="group overflow-hidden border-border/60 p-0 hover:-translate-y-1 hover:shadow-xl transition-all">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={tour.coverUrl || 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={tour.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{tour.title}</h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-display text-lg font-bold text-primary">${tour.startingPrice || 'TBA'}</span>
                          <Button size="sm" variant="ghost" asChild className="gap-1">
                            <Link href={`/tours/${tour.slug}`}>View <ArrowRight className="h-3 w-3" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {relatedEvents.map((event) => (
                    <Card key={event.id} className="group overflow-hidden border-border/60 p-0 hover:-translate-y-1 hover:shadow-xl transition-all">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={event.coverUrl || 'https://images.pexels.com/photos/260457/pexels-photo-260457.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-display text-lg font-bold text-primary">${event.startingPrice || 'TBA'}</span>
                          <Button size="sm" variant="ghost" asChild className="gap-1">
                            <Link href={`/events/${event.slug}`}>View <ArrowRight className="h-3 w-3" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
