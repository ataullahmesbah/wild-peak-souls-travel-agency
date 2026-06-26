import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Clock, Users, Check, X, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';
import { eventService } from '@/lib/services/events.service';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await eventService.getBySlug(params.slug);
  const event = result.success && result.data ? result.data : null;
  return {
    title: event ? `${event.title} — Events` : 'Event — Wild Peak Souls',
    description: event?.shortDescription ?? 'Join this unforgettable adventure event with Wild Peak Souls.',
    openGraph: {
      title: event?.title ?? undefined,
      description: event?.shortDescription ?? undefined,
      images: event?.coverUrl ? [{ url: event.coverUrl }] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const result = await eventService.getBySlug(params.slug);
  if (!result.success || !result.data) return notFound();
  const event = result.data;

  const availableSeats = event.availableSeats ?? event.maximumCapacity ?? 0;
  const remaining = availableSeats - (event.currentBookings ?? 0);
  const isSoldOut = remaining <= 0;

  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={event.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920'}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        <Container className="relative z-10 flex h-full flex-col justify-end pb-16">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              {event.eventType}
            </span>
            {event.isFeatured && (
              <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-white">
                Featured
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            {event.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{(event as { country?: { name?: string } }).country?.name ?? 'Worldwide'}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{event.duration ?? event.durationDays ? `${event.durationDays} days` : 'TBA'}</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{remaining} seats left</span>
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{event.averageRating ?? 0} ({event.reviewCount ?? 1} reviews)</span>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
            {/* Main Content */}
            <div>
              {/* Overview */}
              <Reveal>
                <div className="text-lg leading-relaxed text-foreground/80">
                  {event.overview ?? event.shortDescription ?? 'No description available.'}
                </div>
              </Reveal>

              {/* Gallery */}
              {event.gallery && event.gallery.length > 0 && (
                <Reveal delay={100}>
                  <div className="mt-12">
                    <h3 className="font-display text-xl font-semibold">Gallery</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {event.gallery.map((img, i) => (
                        <div key={img.id ?? i} className="overflow-hidden rounded-xl">
                          <img
                            src={img.url}
                            alt={img.altText ?? `${event.title} ${i + 1}`}
                            className="aspect-[4/3] w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Schedule */}
              {event.schedules && event.schedules.length > 0 && (
                <Reveal delay={150}>
                  <div className="mt-12">
                    <h3 className="font-display text-xl font-semibold">Schedule</h3>
                    <div className="mt-4 space-y-4">
                      {event.schedules.map((s) => (
                        <div key={s.id} className="rounded-xl border border-border/60 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">Day {s.day}</span>
                            {s.title}
                          </div>
                          {s.description && (
                            <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                          )}
                          {s.startTime && s.endTime && (
                            <p className="mt-1 text-xs text-muted-foreground">{s.startTime} – {s.endTime}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Itinerary */}
              {event.itineraries && event.itineraries.length > 0 && (
                <Reveal delay={200}>
                  <div className="mt-12">
                    <h3 className="font-display text-xl font-semibold">Itinerary</h3>
                    <div className="mt-4 space-y-4">
                      {event.itineraries.map((it) => (
                        <div key={it.id} className="rounded-xl border border-border/60 p-4">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-ocean text-xs font-semibold">Day {it.day}</span>
                            <span className="font-semibold">{it.title}</span>
                          </div>
                          {it.description && <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>}
                          {it.activities && it.activities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {it.activities.map((a, i) => (
                                <span key={i} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{a}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Accommodation & Meals */}
              <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {event.accommodations && event.accommodations.length > 0 && (
                  <Reveal delay={250}>
                    <div>
                      <h3 className="font-display text-xl font-semibold">Accommodation</h3>
                      <div className="mt-4 space-y-3">
                        {event.accommodations.map((acc) => (
                          <div key={acc.id} className="rounded-xl border border-border/60 p-4">
                            <div className="font-semibold">{acc.name}</div>
                            {acc.type && <p className="text-xs text-muted-foreground">{acc.type}</p>}
                            {acc.description && <p className="mt-1 text-sm text-muted-foreground">{acc.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}
                {event.meals && event.meals.length > 0 && (
                  <Reveal delay={300}>
                    <div>
                      <h3 className="font-display text-xl font-semibold">Meals</h3>
                      <div className="mt-4 space-y-3">
                        {event.meals.map((meal) => (
                          <div key={meal.id} className="rounded-xl border border-border/60 p-4">
                            <div className="font-semibold">{meal.mealType}</div>
                            {meal.description && <p className="text-sm text-muted-foreground">{meal.description}</p>}
                            {meal.menuItems && meal.menuItems.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {meal.menuItems.map((m, i) => (
                                  <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{m}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}
              </div>

              {/* Included / Excluded */}
              <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {event.includedItems && event.includedItems.length > 0 && (
                  <Reveal delay={350}>
                    <div>
                      <h3 className="font-display text-xl font-semibold">Included</h3>
                      <div className="mt-4 space-y-2">
                        {event.includedItems.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            <span className="text-sm text-foreground/80">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}
                {event.excludedItems && event.excludedItems.length > 0 && (
                  <Reveal delay={400}>
                    <div>
                      <h3 className="font-display text-xl font-semibold">Not Included</h3>
                      <div className="mt-4 space-y-2">
                        {event.excludedItems.map((item, i) => (
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

              {/* Terms & Policies */}
              <div className="mt-12 space-y-8">
                {event.termsConditions && (
                  <Reveal delay={450}>
                    <div>
                      <h3 className="font-display text-xl font-semibold">Terms & Conditions</h3>
                      <div className="mt-4 rounded-xl border border-border/60 p-4 text-sm text-muted-foreground whitespace-pre-wrap">{event.termsConditions}</div>
                    </div>
                  </Reveal>
                )}
                {event.cancellationPolicy && (
                  <Reveal delay={500}>
                    <div>
                      <h3 className="font-display text-xl font-semibold">Cancellation Policy</h3>
                      <div className="mt-4 rounded-xl border border-border/60 p-4 text-sm text-muted-foreground whitespace-pre-wrap">{event.cancellationPolicy}</div>
                    </div>
                  </Reveal>
                )}
                {event.refundPolicy && (
                  <Reveal delay={550}>
                    <div>
                      <h3 className="font-display text-xl font-semibold">Refund Policy</h3>
                      <div className="mt-4 rounded-xl border border-border/60 p-4 text-sm text-muted-foreground whitespace-pre-wrap">{event.refundPolicy}</div>
                    </div>
                  </Reveal>
                )}
              </div>

              {/* FAQ */}
              {event.faqs && event.faqs.length > 0 && (
                <Reveal delay={600}>
                  <div className="mt-12">
                    <h3 className="font-display text-xl font-semibold">Frequently Asked Questions</h3>
                    <div className="mt-4 space-y-3">
                      {event.faqs.map((faq) => (
                        <div key={faq.id} className="rounded-xl border border-border/60 p-4">
                          <div className="font-semibold">{faq.question}</div>
                          <div className="mt-2 text-sm text-muted-foreground">{faq.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>

            {/* Sidebar — Sticky Booking */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Reveal>
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                  <div className="text-sm text-muted-foreground">Price per person</div>
                  <div className="font-display text-3xl font-bold text-primary">
                    ${event.pricePerPerson ?? event.startingPrice ?? 'TBA'}
                  </div>
                  <div className="text-sm text-muted-foreground">{event.currency}</div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Available Seats</span>
                      <span className="font-semibold">{remaining} / {availableSeats}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold">{event.duration ?? event.durationDays ? `${event.durationDays} days` : 'TBA'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-semibold">{event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
                    </div>
                    {event.meetingPoint && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Meeting Point</span>
                        <span className="font-semibold">{event.meetingPoint}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    {isSoldOut ? (
                      <Button disabled className="w-full">Sold Out</Button>
                    ) : (
                      <Button size="lg" asChild className="w-full gap-2">
                        <Link href={`/events/${event.slug}/book`}>
                          Book This Event
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  {event.childPrice && (
                    <div className="mt-3 text-center text-xs text-muted-foreground">
                      Children: ${event.childPrice} / {event.currency}
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Google Map */}
              {event.googleMapUrl && (
                <Reveal delay={100}>
                  <div className="mt-6 overflow-hidden rounded-2xl border border-border/60">
                    <iframe
                      src={event.googleMapUrl}
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </Reveal>
              )}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
