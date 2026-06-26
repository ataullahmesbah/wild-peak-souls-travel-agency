'use client';

import Link from 'next/link';
import { ArrowRight, Compass, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';
import { Search } from 'lucide-react';

export function HomeHero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Majestic mountain landscape"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <Reveal>
            <Badge
              variant="secondary"
              className="mb-6 border-white/20 bg-white/10 text-white backdrop-blur-md"
            >
              <Mountain className="mr-1.5 h-3.5 w-3.5" />
              Premium Adventure Travel Since 2014
            </Badge>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
              Where Souls Meet
              <br />
              <span className="bg-gradient-to-r from-mountain-300 to-ocean-300 bg-clip-text text-transparent">
                the Wild Peaks
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-lg text-white/80 text-pretty sm:text-xl">
              Discover breathtaking destinations, book guided expeditions, and
              embark on unforgettable journeys crafted for the adventurous soul.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="gap-2 text-base">
                <Link href="/destinations">
                  Explore Destinations
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="gap-2 border-white/20 bg-white/10 text-base text-white backdrop-blur-md hover:bg-white/20"
              >
                <Link href="/tours">
                  <Compass className="h-4 w-4" />
                  Browse Tours
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: 'Destinations', value: '120+' },
                { label: 'Happy Travelers', value: '15K+' },
                { label: 'Expert Guides', value: '80+' },
                { label: 'Years of Adventure', value: '12' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-bold text-white sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
