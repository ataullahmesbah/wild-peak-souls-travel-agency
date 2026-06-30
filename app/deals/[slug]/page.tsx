import Link from 'next/link';
import { ArrowRight, Calendar, Tag, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';
import { Reveal } from '@/components/layout/reveal';
import { hotDealService } from '@/lib/services/cms.service';
import { toursService } from '@/lib/services/tours.service';
import { destinationsService } from '@/lib/services/destinations.service';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await hotDealService.getBySlug(params.slug);
  if (!result.success || !result.data) {
    return { title: 'Deal Not Found — Wild Peak Souls' };
  }
  const deal = result.data;
  return {
    title: `${deal.title} — Hot Deal — Wild Peak Souls`,
    description: deal.subtitle || deal.description || 'Limited time adventure deal',
    openGraph: {
      title: deal.title,
      description: deal.subtitle || '',
      images: deal.coverUrl ? [deal.coverUrl] : [],
    },
  };
}

export default async function DealDetailPage({ params }: Props) {
  const result = await hotDealService.getBySlug(params.slug);
  if (!result.success || !result.data) {
    notFound();
  }

  const deal = result.data;

  const [toursResult, destinationsResult] = await Promise.all([
    toursService.getFeatured(3),
    destinationsService.getFeatured(3),
  ]);

  const relatedTours = toursResult.success && toursResult.data ? toursResult.data : [];
  const relatedDestinations = destinationsResult.success && destinationsResult.data ? destinationsResult.data : [];

  const endDate = deal.endsAt ? new Date(deal.endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Limited Time';
  const startDate = deal.startsAt ? new Date(deal.startsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Now';

  const savings = deal.originalPrice && deal.discountedPrice ? deal.originalPrice - deal.discountedPrice : 0;
  const discountPercent = deal.discountPercent || (deal.originalPrice && deal.discountedPrice ? Math.round((1 - deal.discountedPrice / deal.originalPrice) * 100) : 0);

  return (
    <>
      <PageHeader
        title={deal.title}
        subtitle={deal.subtitle || 'Limited time offer'}
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
                    src={deal.coverUrl || 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                    alt={deal.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <Badge className="bg-red-500 text-white gap-1">
                      <Tag className="h-3 w-3" />
                      {discountPercent}% OFF
                    </Badge>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="mt-8">
                  <h1 className="font-display text-3xl font-bold">{deal.title}</h1>
                  {deal.subtitle && (
                    <p className="mt-2 text-lg text-muted-foreground">{deal.subtitle}</p>
                  )}
                </div>
              </Reveal>

              <Reveal delay={150}>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Valid: {startDate} — {endDate}</span>
                  </div>
                  {deal.currency && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Currency: {deal.currency}</span>
                    </div>
                  )}
                </div>
              </Reveal>

              {deal.description && (
                <Reveal delay={200}>
                  <div className="mt-8 prose dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed">{deal.description}</p>
                  </div>
                </Reveal>
              )}

              {/* Pricing */}
              <Reveal delay={250}>
                <Card className="mt-8 border-border/60">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Deal Price</p>
                        <div className="flex items-baseline gap-3 mt-1">
                          <span className="font-display text-3xl font-bold text-primary">
                            ${deal.discountedPrice}
                          </span>
                          {deal.originalPrice && (
                            <span className="text-lg text-muted-foreground line-through">
                              ${deal.originalPrice}
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
                        <Link href={deal.ctaUrl || deal.externalUrl || '/tours'}>
                          {deal.ctaText || 'Claim Deal'} <ArrowRight className="h-4 w-4" />
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
                    <h3 className="font-semibold">Deal Details</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="font-medium">${deal.originalPrice || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deal Price</span>
                        <span className="font-medium text-primary">${deal.discountedPrice || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-red-500">{discountPercent}%</span>
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

              {/* Related Destinations */}
              {relatedDestinations.length > 0 && (
                <Reveal delay={200}>
                  <Card className="border-border/60">
                    <CardContent className="p-6">
                      <h3 className="font-semibold">Related Destinations</h3>
                      <div className="mt-4 space-y-3">
                        {relatedDestinations.map((dest: any) => (
                          <Link
                            key={dest.id}
                            href={`/destinations/${dest.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0">
                              <img
                                src={dest.coverUrl || 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=200'}
                                alt={dest.title}
                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium group-hover:text-primary transition-colors">{dest.title}</p>
                              <p className="text-xs text-muted-foreground">{(dest as any).country?.name ?? ''}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              )}
            </div>
          </div>

          {/* Related Tours */}
          {relatedTours.length > 0 && (
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
                </div>
              </div>
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
