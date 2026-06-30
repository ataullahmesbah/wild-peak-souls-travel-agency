'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Mountain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';

export function HomeSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  return (
    <div className="relative z-20 -mt-10 px-4 sm:px-6">
      <Container>
        <Reveal>
          <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-xl backdrop-blur-md sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search destinations, tours, or events..."
                  className="h-11 w-full rounded-lg border border-border/60 bg-background pl-10 pr-4 text-sm outline-none ring-offset-background focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="relative min-w-[160px]">
                <Mountain className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border/60 bg-background pl-10 pr-4 text-sm outline-none ring-offset-background focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Content</option>
                  <option value="tours">Tours</option>
                  <option value="events">Events</option>
                  <option value="destinations">Destinations</option>
                </select>
              </div>
              <Button size="default" className="h-11 gap-2 px-6" asChild>
                <Link href={`/search?q=${encodeURIComponent(searchTerm)}${category ? `&type=${category}` : ''}`}>
                  <ArrowRight className="h-4 w-4" />
                  Search
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
