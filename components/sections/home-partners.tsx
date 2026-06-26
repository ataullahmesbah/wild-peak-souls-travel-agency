'use client';

import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';

const partners = [
  'National Geographic', 'REI Co-op', 'Patagonia', 'The North Face',
  'Columbia', 'Arc\'teryx', 'Black Diamond', 'Salomon',
];

export function HomePartners() {
  return (
    <section className="py-12 border-t border-border/40">
      <Container>
        <Reveal>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by leading adventure brands
          </p>
        </Reveal>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {partners.map((name, i) => (
            <Reveal key={name} delay={i * 40}>
              <span className="text-sm font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                {name}
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
