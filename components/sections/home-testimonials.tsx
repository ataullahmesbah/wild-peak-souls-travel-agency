'use client';

import { Quote, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Adventure Photographer',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    content: 'Wild Peak Souls transformed my Himalayan dream into reality. The guides were world-class, the logistics flawless, and the experience unforgettable.',
    rating: 5,
  },
  {
    name: 'James Chen',
    role: 'Trekking Enthusiast',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    content: 'I have trekked with many operators, but none match the professionalism and care of Wild Peak Souls. Every detail was handled perfectly.',
    rating: 5,
  },
  {
    name: 'Elena Rodriguez',
    role: 'Travel Blogger',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
    content: 'From Patagonia to the Alps, every expedition has been extraordinary. This is adventure travel done right — premium, safe, and soul-stirring.',
    rating: 5,
  },
];

export function HomeTestimonials() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Traveler Stories"
            title="Voices from the Trail"
            description="Real experiences from adventurers who trusted us with their journeys."
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <Card className="h-full border-border/60">
                <CardContent className="flex h-full flex-col p-6">
                  <Quote className="h-8 w-8 text-primary/30" />
                  <p className="mt-4 flex-1 text-pretty text-foreground/80">{t.content}</p>
                  <div className="mt-6 flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                    <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
