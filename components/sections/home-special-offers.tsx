import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';
import { specialOfferService } from '@/lib/services/cms.service';

const fallbackOffers = [
  { title: 'Seasonal Alpine Adventure', subtitle: 'Spring expeditions in the Swiss Alps', coverUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800', badgeText: 'Spring', discountPercent: 15, originalPrice: 3299, discountedPrice: 2804, currency: 'USD', ctaText: 'Explore', slug: 'seasonal-alpine-adventure' },
  { title: 'Trekking Family Package', subtitle: 'Bring the family and save together', coverUrl: 'https://images.pexels.com/photos/1624606/pexels-photo-1624606.jpeg?auto=compress&cs=tinysrgb&w=800', badgeText: 'Family', discountPercent: 20, originalPrice: 1899, discountedPrice: 1519, currency: 'USD', ctaText: 'Family Deal', slug: 'trekking-family-package' },
  { title: 'Adventure Weekender Pass', subtitle: '3 weekend adventures for the price of 2', coverUrl: 'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&w=800', badgeText: 'Bundle', discountPercent: 33, originalPrice: 599, discountedPrice: 399, currency: 'USD', ctaText: 'Get Bundle', slug: 'adventure-weekender-pass' },
  { title: 'Photography Masterclass', subtitle: 'Learn from pros in the wild', coverUrl: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=800', badgeText: 'Workshop', discountPercent: 10, originalPrice: 1299, discountedPrice: 1169, currency: 'USD', ctaText: 'Join Class', slug: 'photography-masterclass' },
];

export async function HomeSpecialOffers() {
  const result = await specialOfferService.getActive();
  const raw = result.success && result.data && result.data.length > 0 ? result.data : fallbackOffers;
  const offers = raw.map((o: any) => ({
    slug: o.slug,
    title: o.title,
    subtitle: o.subtitle,
    coverUrl: o.coverUrl,
    badgeText: o.badgeText,
    discountPercent: o.discountPercent,
    discountedPrice: o.discountedPrice,
    originalPrice: o.originalPrice,
    ctaText: o.ctaText,
  }));

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="Curated Offers"
              title="Special Offers"
              description="Hand-picked packages for every kind of adventurer."
              className="sm:max-w-xl"
            />
            <Button variant="outline" asChild className="gap-2 shrink-0">
              <Link href="/offers">All Offers <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((offer, i) => (
            <Reveal key={offer.slug} delay={i * 80}>
              <Card className="group h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={offer.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'} alt={offer.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-ocean text-white shadow-md gap-1">
                      <Sparkles className="h-3 w-3" />
                      {offer.badgeText ?? 'Special'}
                    </Badge>
                  </div>
                  <div className="absolute right-3 top-3">
                    <Badge className="bg-white/90 text-foreground shadow-md">
                      {offer.discountPercent}% OFF
                    </Badge>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-base font-bold text-white">{offer.title}</h3>
                    <p className="mt-0.5 text-sm text-white/80">{offer.subtitle}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-primary">${offer.discountedPrice}</span>
                    <span className="text-xs text-muted-foreground line-through">${offer.originalPrice}</span>
                  </div>
                  <Button size="sm" className="mt-3 w-full gap-1" asChild>
                    <Link href={`/offers/${offer.slug}`}>
                      {offer.ctaText ?? 'View Offer'} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
