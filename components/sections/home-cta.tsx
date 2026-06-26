'use client';

import Link from 'next/link';
import { ArrowRight, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';

export function HomeCTA() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mountain-700 via-forest-700 to-ocean-800 px-6 py-16 text-center sm:px-12 lg:py-24">
            <div className="absolute inset-0 bg-mesh opacity-20" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Plane className="mx-auto mb-6 h-12 w-12 text-white/80" />
              <h2 className="font-display text-3xl font-bold text-white text-balance sm:text-4xl lg:text-5xl">
                Your Next Adventure Awaits
              </h2>
              <p className="mt-4 text-lg text-white/80 text-pretty">
                Join thousands of travelers who have discovered the world's most
                breathtaking destinations with Wild Peak Souls.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="gap-2 bg-white text-primary hover:bg-white/90">
                  <Link href="/register">
                    Start Your Journey
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="gap-2 border-white/30 bg-white/5 text-white hover:bg-white/15"
                >
                  <Link href="/contact">Talk to a Guide</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
