'use client';

import { Award, ShieldCheck, Heart, Globe2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';

const items = [
  { icon: Award, title: 'Expert Guides', desc: 'Certified, experienced local guides who know every trail and peak intimately.' },
  { icon: ShieldCheck, title: 'Safety First', desc: 'Comprehensive safety protocols, insurance coverage, and 24/7 emergency support.' },
  { icon: Heart, title: 'Small Groups', desc: 'Intimate group sizes for personalized attention and authentic experiences.' },
  { icon: Globe2, title: 'Global Reach', desc: 'Adventures across 6 continents with seamless booking and local support.' },
];

export function HomeWhyUs() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-mountain-50/40 to-background dark:from-mountain-900/10">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Why Wild Peak Souls"
            title="Adventure Travel, Elevated"
            description="We don't just take you to the mountains — we craft experiences that stay with you forever."
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <Card className="h-full border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-mountain-500 to-ocean-600 text-white shadow-md">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground text-pretty">{item.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
