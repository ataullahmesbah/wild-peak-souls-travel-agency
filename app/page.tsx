import { Suspense } from 'react';
import { HomeHero } from '@/components/sections/home-hero';
import { HomeSearch } from '@/components/sections/home-search';
import { HomeCategories } from '@/components/sections/home-categories';
import { HomeDestinations } from '@/components/sections/home-destinations';
import { HomeTours } from '@/components/sections/home-tours';
import { HomeEvents } from '@/components/sections/home-events';
import { HomeHotDeals } from '@/components/sections/home-hot-deals';
import { HomeSpecialOffers } from '@/components/sections/home-special-offers';
import { HomeWhyUs } from '@/components/sections/home-why-us';
import { HomeStats } from '@/components/sections/home-stats';
import { HomeTestimonials } from '@/components/sections/home-testimonials';
import { HomeBlog } from '@/components/sections/home-blog';
import { HomeNewsletter } from '@/components/sections/home-newsletter';
import { HomePartners } from '@/components/sections/home-partners';
import { HomeCTA } from '@/components/sections/home-cta';

export const metadata = {
  title: 'Wild Peak Souls — Premium Adventure Travel & Trekking',
  description: 'Discover breathtaking destinations, book guided expeditions, and embark on unforgettable journeys crafted for the adventurous soul.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Wild Peak Souls — Premium Adventure Travel',
    description: 'Discover breathtaking destinations, book guided expeditions, and embark on unforgettable journeys.',
    url: 'https://wildpeaksouls.com',
  },
};

export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeSearch />
      <HomeCategories />
      <Suspense fallback={null}>
        <HomeHotDeals />
      </Suspense>
      <Suspense fallback={null}>
        <HomeSpecialOffers />
      </Suspense>
      <Suspense fallback={null}>
        <HomeDestinations />
      </Suspense>
      <Suspense fallback={null}>
        <HomeTours />
      </Suspense>
      <Suspense fallback={null}>
        <HomeEvents />
      </Suspense>
      <HomeWhyUs />
      <HomeStats />
      <HomeTestimonials />
      <Suspense fallback={null}>
        <HomeBlog />
      </Suspense>
      <HomeNewsletter />
      <HomePartners />
      <HomeCTA />
    </>
  );
}
