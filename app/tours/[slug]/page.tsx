import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Calendar, TrendingUp, Star, Check, X, ArrowRight,
  Users, Clock, Shield, Heart, Share2, Camera, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const difficultyColor = {
    EASY: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    CHALLENGING: 'bg-orange-100 text-orange-800',
    DIFFICULT: 'bg-red-100 text-red-800',
    EXTREME: 'bg-purple-100 text-purple-800',
  }[tour.difficulty] ?? 'bg-muted text-muted-foreground';

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={tour.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920'}
          alt={tour.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <Container className="relative z-10 flex h-full flex-col justify-end pb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {tour.isFeatured && (
              <Badge className="bg-primary text-white shadow-lg">Featured</Badge>
            )}
            <Badge className={difficultyColor}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {tour.difficulty}
            </Badge>
            {(tour as any).category?.name && (
              <Badge variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-md">
                {(tour as any).category.name}
              </Badge>
            )}
          </div>
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl text-balance">
            {tour.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{(tour as any).country?.name ?? 'Worldwide'}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{tour.duration ?? 'Variable'}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{tour.durationDays ? `${tour.durationDays}D/${tour.durationNights}N` : 'Flexible'}</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{tour.averageRating ?? 0} ({tour.reviewCount ?? 0} reviews)</span>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Reveal>
                <div className="text-lg leading-relaxed text-foreground/80">
                  {tour.description ?? tour.shortDescription ?? 'No description available.'}
                </div>
              </Reveal>

              {/* Gallery */}
              {tour.galleryUrls && tour.galleryUrls.length > 0 && (
                <Reveal delay={100}>
                  <div className="mt-12">
                    <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                      <Camera className="h-5 w-5" /> Gallery
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {tour.galleryUrls.map((url, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-lg border">
                          <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Highlights */}
              {tour.highlights && tour.highlights.length > 0 && (
                <Reveal delay={150}>
                  <div className="mt-12">
                    <h3 className="font-display text-xl font-semibold">Highlights</h3>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {tour.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-3.5 w-3.5 text-green-700" />
                          </div>
                          <span className="text-sm text-foreground/80">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Inclusions & Exclusions */}
              <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {tour.includedItems && tour.includedItems.length > 0 && (
                  <Reveal delay={200}>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-green-700">What's Included</h3>
                      <div className="mt-4 space-y-3">
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
                  <Reveal delay={250}>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-red-700">Not Included</h3>
                      <div className="mt-4 space-y-3">
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

              {/* Reviews */}
              {(tour as any).reviews && (tour as any).reviews.length > 0 && (
                <Reveal delay={300}>
                  <div className="mt-12">
                    <h3 className="font-display text-xl font-semibold">Traveler Reviews</h3>
                    <div className="mt-4 space-y-4">
                      {(tour as any).reviews.map((review: any, i: number) => (
                        <Card key={i} className="p-5 border-border/60">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="font-display text-sm font-bold text-primary">
                                {(review.user?.name ?? 'Guest').charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{review.user?.name ?? 'Guest'}</span>
                                <div className="flex items-center gap-0.5">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-foreground/70">{review.body}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Booking Card */}
                <Reveal delay={100}>
                  <Card className="border-border/60 p-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Starting from</span>
                        <div className="font-display text-3xl font-bold text-primary">
                          ${tour.startingPrice ?? 'TBA'}
                        </div>
                        <span className="text-sm text-muted-foreground">per person</span>
                      </div>
                      <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-4 w-4" />Group size</span>
                          <span className="font-medium">{tour.minGroupSize ?? 1} - {tour.maxGroupSize ?? 'Flexible'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-muted-foreground"><Shield className="h-4 w-4" />Insurance</span>
                          <span className="font-medium">Included</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-muted-foreground"><Star className="h-4 w-4" />Rating</span>
                          <span className="font-medium">{tour.averageRating ?? 'N/A'}</span>
                        </div>
                      </div>
                      <Button size="lg" className="w-full gap-2" asChild>
                        <Link href="/book">
                          Book Now
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Heart className="h-4 w-4" /> Save
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Share2 className="h-4 w-4" /> Share
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Reveal>

                {/* Quick Info */}
                <Reveal delay={200}>
                  <Card className="border-border/60 p-5">
                    <h4 className="font-display font-semibold mb-3">Quick Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{tour.duration ?? 'Flexible'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Difficulty</span>
                        <span className="font-medium">{tour.difficulty}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Max Group</span>
                        <span className="font-medium">{tour.maxGroupSize ?? 'Flexible'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Views</span>
                        <span className="font-medium">{tour.viewCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bookings</span>
                        <span className="font-medium">{tour.bookingCount}</span>
                      </div>
                    </div>
                  </Card>
                </Reveal>

                {/* More Tours */}
                <Reveal delay={300}>
                  <Card className="border-border/60 p-5">
                    <h4 className="font-display font-semibold mb-3">More Tours</h4>
                    <div className="space-y-3">
                      <Link href="/tours" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <ChevronRight className="h-4 w-4" /> All Tours
                      </Link>
                      <Link href="/events" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <ChevronRight className="h-4 w-4" /> Upcoming Events
                      </Link>
                      <Link href="/destinations" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <ChevronRight className="h-4 w-4" /> Destinations
                      </Link>
                    </div>
                  </Card>
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
