'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, MapPin, Calendar, Mountain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';

export function HomeSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');

  return (
    <div className="relative z-20 -mt-10 px-4 sm:px-6">
      <Container>
        <Reveal>
          <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-xl backdrop-blur-md sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search Input */}
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

              {/* Category Select */}
              <div className="relative min-w-[140px]">
                <Mountain className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border/60 bg-background pl-10 pr-4 text-sm outline-none ring-offset-background focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Types</option>
                  <option value="trekking">Trekking</option>
                  <option value="camping">Camping</option>
                  <option value="expedition">Expedition</option>
                  <option value="adventure">Adventure</option>
                  <option value="photography">Photography</option>
                </select>
              </div>

              {/* Duration Select */}
              <div className="relative min-w-[140px]">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border/60 bg-background pl-10 pr-4 text-sm outline-none ring-offset-background focus:ring-1 focus:ring-primary"
                >
                  <option value="">Any Duration</option>
                  <option value="1">1 Day</option>
                  <option value="2-3">2-3 Days</option>
                  <option value="4-7">4-7 Days</option>
                  <option value="8-14">8-14 Days</option>
                  <option value="15+">15+ Days</option>
                </select>
              </div>

              {/* Search Button */}
              <Button size="default" className="h-11 gap-2 px-6" asChild>
                <Link href={`/tours?search=${encodeURIComponent(searchTerm)}${category ? `&category=${category}` : ''}${duration ? `&duration=${duration}` : ''}`}>
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
