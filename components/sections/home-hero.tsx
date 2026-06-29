'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Mountain, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';

const heroSlides = [
  {
    image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Where Souls Meet',
    subtitle: 'the Wild Peaks',
    description: 'Discover breathtaking destinations, book guided expeditions, and embark on unforgettable journeys crafted for the adventurous soul.',
  },
  {
    image: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Uncharted Horizons',
    subtitle: 'Await Your Arrival',
    description: 'From the icy summits of the Himalayas to the golden shores of Patagonia, every journey is a story waiting to be written.',
  },
  {
    image: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Adventure Beyond',
    subtitle: 'Your Comfort Zone',
    description: 'Expert guides, curated routes, and premium experiences designed for travelers who refuse to settle for ordinary.',
  },
];

export function HomeHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsLoaded(true);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden">
      {/* Background Slides */}
      {heroSlides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={s.image}
            alt={s.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        </div>
      ))}

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <div
            className={`transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Badge
              variant="secondary"
              className="mb-6 border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
            >
              <Mountain className="mr-1.5 h-3.5 w-3.5" />
              Premium Adventure Travel Since 2014
            </Badge>
          </div>

          <div
            className={`transition-all duration-700 delay-100 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
              {slide.title}
              <br />
              <span className="bg-gradient-to-r from-mountain-300 to-ocean-300 bg-clip-text text-transparent">
                {slide.subtitle}
              </span>
            </h1>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="mt-6 max-w-xl text-lg text-white/80 text-pretty sm:text-xl">
              {slide.description}
            </p>
          </div>

          <div
            className={`transition-all duration-700 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="gap-2 text-base shadow-lg shadow-primary/20">
                <Link href="/destinations">
                  Explore Destinations
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="gap-2 border-white/30 bg-white/5 text-white backdrop-blur-md hover:bg-white/15 hover:border-white/40"
              >
                <Link href="/tours">
                  <Compass className="h-4 w-4" />
                  Browse Tours
                </Link>
              </Button>
            </div>
          </div>

          <div
            className={`transition-all duration-700 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: 'Destinations', value: '120+' },
                { label: 'Happy Travelers', value: '15K+' },
                { label: 'Expert Guides', value: '80+' },
                { label: 'Years of Adventure', value: '12' },
              ].map((stat, i) => (
                <div key={stat.label} className="group">
                  <div className="font-display text-3xl font-bold text-white sm:text-4xl group-hover:text-mountain-300 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentSlide ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-white/50" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
