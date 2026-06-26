'use client';

import Link from 'next/link';
import { Mountain, Footprints, Tent, Compass, Camera, Binoculars } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';

const categories = [
  { icon: Mountain, title: 'Trekking', desc: 'Multi-day mountain expeditions', href: '/trekking', count: '45 tours' },
  { icon: Footprints, title: 'Hiking', desc: 'Day trails & scenic walks', href: '/hiking', count: '32 tours' },
  { icon: Tent, title: 'Camping', desc: 'Wilderness camping experiences', href: '/camping', count: '28 tours' },
  { icon: Compass, title: 'Expeditions', desc: 'Extreme adventure challenges', href: '/expeditions', count: '18 tours' },
  { icon: Camera, title: 'Photography', desc: 'Capture the wild with pros', href: '/photography', count: '12 tours' },
  { icon: Binoculars, title: 'Wildlife', desc: 'Safari & nature observation', href: '/wildlife', count: '22 tours' },
];

export function HomeCategories() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Adventure Types"
            title="Find Your Kind of Adventure"
            description="From serene hikes to extreme expeditions, we curate experiences for every level of adventurer."
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <Reveal key={cat.title} delay={i * 60}>
              <Link href={cat.href} className="group block h-full">
                <Card className="h-full overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <cat.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{cat.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{cat.desc}</p>
                      <p className="mt-2 text-xs font-medium text-primary">{cat.count}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
