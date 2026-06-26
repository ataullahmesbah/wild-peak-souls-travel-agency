'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Minus, Plus, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';

export default function EventBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const pricePerPerson = 1499;
  const childPrice = 899;
  const total = adults * pricePerPerson + children * childPrice;
  const remainingSeats = 12;
  const requested = adults + children + infants;

  return (
    <>
      <section className="py-8 border-b border-border/40">
        <Container>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href={`/events/${slug}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Event
            </Link>
          </Button>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Reveal>
              <h1 className="font-display text-3xl font-bold">Book Your Adventure</h1>
              <p className="mt-2 text-muted-foreground">Select the number of participants and submit your booking request.</p>
            </Reveal>

            <Reveal delay={100}>
              <Card className="mt-8 border-border/60">
                <CardContent className="p-6">
                  {/* Seat availability */}
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Remaining Seats</span>
                    </div>
                    <span className="font-semibold">{remainingSeats} available</span>
                  </div>

                  {/* Participants */}
                  <div className="mt-6 space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Adults</div>
                        <div className="text-sm text-muted-foreground">${pricePerPerson} per person</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-semibold">{adults}</span>
                        <button
                          onClick={() => setAdults(Math.min(remainingSeats - requested + adults, adults + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Children</div>
                        <div className="text-sm text-muted-foreground">${childPrice} per child</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-semibold">{children}</span>
                        <button
                          onClick={() => setChildren(Math.min(remainingSeats - requested + children, children + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Infants</div>
                        <div className="text-sm text-muted-foreground">Free (under 2)</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setInfants(Math.max(0, infants - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-semibold">{infants}</span>
                        <button
                          onClick={() => setInfants(Math.min(remainingSeats - requested + infants, infants + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Requested > remaining warning */}
                  {requested > remainingSeats && (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">
                      Not enough seats available. Please reduce the number of participants.
                    </div>
                  )}

                  {/* Total */}
                  <div className="mt-6 border-t border-border/60 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Participants</span>
                      <span className="font-semibold">{requested}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-display text-2xl font-bold text-primary">${total}</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="mt-6">
                    {submitted ? (
                      <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-950/30">
                        <Check className="h-5 w-5" />
                        <span>Booking request submitted! We will contact you shortly.</span>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        className="w-full"
                        disabled={requested > remainingSeats}
                        onClick={() => setSubmitted(true)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Submit Booking Request
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Note:</p>
                <p className="mt-1">
                  This is a booking request. No payment is processed at this stage.
                  Our team will review your request and confirm availability within 24 hours.
                  Full payment details will be shared after confirmation.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
