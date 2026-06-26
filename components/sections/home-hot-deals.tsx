import Link from 'next/link';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';
import { hotDealService } from '@/lib/services/cms.service';

const fallbackDeals = [
  { title: 'Summer Expedition Sale', subtitle: 'Save 30% on all Himalayan treks', coverUrl: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800', discountPercent: 30, originalPrice: 2499, discountedPrice: 1749, currency: 'USD', ctaText: 'Claim Deal', endsAt: 'Jul 31, 2026', slug: 'summer-expedition-sale' },
  { title: 'Early Bird Patagonia', subtitle: 'Book 60 days ahead and save 25%', coverUrl: 'https://images.pexels.com/photos/260457/pexels-photo-260457.jpeg?auto=compress&cs=tinysrgb&w=800', discountPercent: 25, originalPrice: 2199, discountedPrice: 1649, currency: 'USD', ctaText: 'Book Early', endsAt: 'Aug 15, 2026', slug: 'early-bird-patagonia' },
  { title: 'Group Camping Discount', subtitle: 'Groups of 4+ get 20% off', coverUrl: 'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&w=800', discountPercent: 20, originalPrice: 899, discountedPrice: 719, currency: 'USD', ctaText: 'Start Group', endsAt: 'Sep 30, 2026', slug: 'group-camping-discount' },
];

export async function HomeHotDeals() {
  const result = await hotDealService.getActive();
  const raw = result.success && result.data && result.data.length > 0 ? result.data : fallbackDeals;
  const deals = raw.map((d: any) => ({
    slug: d.slug,
    title: d.title,
    subtitle: d.subtitle,
    coverUrl: d.coverUrl,
    discountPercent: d.discountPercent,
    discountedPrice: d.discountedPrice,
    originalPrice: d.originalPrice,
    ctaText: d.ctaText,
    endsAt: d.endsAt,
  }));

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-mountain-50/30 dark:to-mountain-900/5">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="Limited Time"
              title="Hot Deals"
              description="Exclusive offers on our most popular adventures. Book before they expire."
              className="sm:max-w-xl"
            />
            <Button variant="outline" asChild className="gap-2 shrink-0">
              <Link href="/deals">All Deals <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {deals.map((deal, i) => (
            <Reveal key={deal.slug} delay={i * 100}>
              <Card className="group h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={deal.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'} alt={deal.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-red-500 text-white shadow-md gap-1">
                      <Tag className="h-3 w-3" />
                      {deal.discountPercent}% OFF
                    </Badge>
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                    <Clock className="h-3 w-3" />
                    Ends {deal.endsAt ? new Date(deal.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : deal.endsAt ?? 'Soon'}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-lg font-bold text-white">{deal.title}</h3>
                    <p className="mt-0.5 text-sm text-white/80">{deal.subtitle}</p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl font-bold text-primary">
                      ${deal.discountedPrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${deal.originalPrice}
                    </span>
                    <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                      Save ${deal.originalPrice - deal.discountedPrice}
                    </Badge>
                  </div>
                  <Button className="mt-4 w-full gap-1" asChild>
                    <Link href={`/deals/${deal.slug}`}>
                      {deal.ctaText ?? 'View Deal'} <ArrowRight className="h-3.5 w-3.5" />
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
