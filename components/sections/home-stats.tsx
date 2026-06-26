'use client';

import { Users, Globe2, Award, Star } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';

export function HomeStats() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-mountain-700 via-forest-700 to-ocean-700 py-8">
      <div className="absolute inset-0 bg-mesh opacity-20" />
      <Container className="relative z-10">
        <div className="grid grid-cols-2 gap-8 py-8 lg:grid-cols-4">
          {[
            { icon: Users, value: '15,000+', label: 'Happy Travelers' },
            { icon: Globe2, value: '120+', label: 'Destinations Worldwide' },
            { icon: Award, value: '80+', label: 'Expert Guides' },
            { icon: Star, value: '4.9/5', label: 'Average Rating' },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80} className="text-center text-white">
              <stat.icon className="mx-auto mb-3 h-8 w-8 text-white/80" />
              <div className="font-display text-3xl font-bold sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm text-white/70">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
