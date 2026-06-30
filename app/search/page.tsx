import Link from 'next/link';
import { ArrowRight, MapPin, Calendar, TrendingUp, Search, Mountain, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';
import { Reveal } from '@/components/layout/reveal';
import { prisma } from '@/lib/db';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: { q?: string; type?: string };
}

export const metadata: Metadata = {
  title: 'Search — Wild Peak Souls',
  description: 'Search tours, events, and destinations across our adventure platform.',
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() ?? '';
  const type = searchParams.type?.toLowerCase() ?? '';

  let tours: any[] = [];
  let events: any[] = [];
  let destinations: any[] = [];
  let countries: any[] = [];
  let cities: any[] = [];

  if (query) {
    const searchQuery = { contains: query, mode: 'insensitive' as const };

    if (!type || type === 'tours') {
      tours = await prisma.tour.findMany({
        where: {
          isActive: true,
          status: 'PUBLISHED',
          OR: [
            { title: searchQuery },
            { description: searchQuery },
            { shortDescription: searchQuery },
            { slug: searchQuery },
            { duration: searchQuery },
          ],
        },
        include: { category: true, destination: true, country: true },
        take: 12,
        orderBy: { isFeatured: 'desc' },
      });
    }

    if (!type || type === 'events') {
      events = await prisma.event.findMany({
        where: {
          isActive: true,
          status: 'PUBLISHED',
          OR: [
            { title: searchQuery },
            { overview: searchQuery },
            { shortDescription: searchQuery },
            { slug: searchQuery },
          ],
        },
        include: { category: true, destination: true, country: true },
        take: 12,
        orderBy: { isFeatured: 'desc' },
      });
    }

    if (!type || type === 'destinations') {
      destinations = await prisma.destination.findMany({
        where: {
          isActive: true,
          OR: [
            { title: searchQuery },
            { description: searchQuery },
            { shortDescription: searchQuery },
            { slug: searchQuery },
            { bestSeason: searchQuery },
            { climate: searchQuery },
          ],
        },
        include: { country: true },
        take: 12,
        orderBy: { isFeatured: 'desc' },
      });
    }

    countries = await prisma.country.findMany({
      where: {
        isActive: true,
        OR: [
          { name: searchQuery },
          { description: searchQuery },
          { slug: searchQuery },
        ],
      },
      take: 6,
    });

    cities = await prisma.city.findMany({
      where: {
        isActive: true,
        OR: [
          { name: searchQuery },
          { description: searchQuery },
          { slug: searchQuery },
        ],
      },
      include: { country: true },
      take: 6,
    });
  }

  const totalResults = tours.length + events.length + destinations.length + countries.length + cities.length;
  const hasResults = totalResults > 0;

  return (
    <>
      <PageHeader
        title={query ? `Search Results for "${query}"` : 'Search'}
        subtitle={query ? `Found ${totalResults} results across all content` : 'Search for tours, events, and destinations'}
      />
      <section className="py-16 lg:py-24">
        <Container>
          {/* Search Form */}
          <Reveal>
            <form action="/search" className="mb-12 max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="q"
                    type="text"
                    defaultValue={query}
                    placeholder="Search destinations, tours, events..."
                    className="h-12 w-full rounded-lg border border-border/60 bg-background pl-10 pr-4 text-sm outline-none ring-offset-background focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="h-12 gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
              {/* Filter tabs */}
              <div className="flex gap-2 mt-4">
                {(['all', 'tours', 'events', 'destinations'] as const).map((filter) => (
                  <Link
                    key={filter}
                    href={`/search?q=${encodeURIComponent(query)}${filter !== 'all' ? `&type=${filter}` : ''}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      (type === '' && filter === 'all') || type === filter
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {filter === 'all' ? `All (${totalResults})` : `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${
                      filter === 'tours' ? tours.length : filter === 'events' ? events.length : destinations.length
                    })`}
                  </Link>
                ))}
              </div>
            </form>
          </Reveal>

          {/* No Results */}
          {!hasResults && query && (
            <Reveal>
              <div className="text-center py-20">
                <Mountain className="mx-auto h-16 w-16 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-semibold">No results found</h3>
                <p className="mt-2 text-muted-foreground">Try different keywords or browse our categories.</p>
                <div className="mt-6 flex gap-3 justify-center">
                  <Button variant="outline" asChild><Link href="/tours">Browse Tours</Link></Button>
                  <Button variant="outline" asChild><Link href="/events">Browse Events</Link></Button>
                  <Button variant="outline" asChild><Link href="/destinations">Browse Destinations</Link></Button>
                </div>
              </div>
            </Reveal>
          )}

          {/* Tours Results */}
          {tours.length > 0 && (
            <Reveal>
              <div className="mb-12">
                <h2 className="font-display text-xl font-bold mb-4">Tours ({tours.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tours.map((tour, i) => (
                    <Card key={tour.id} className="group overflow-hidden border-border/60 p-0 hover:-translate-y-1 hover:shadow-xl transition-all">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={tour.coverUrl || 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={tour.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {tour.isFeatured && <Badge className="absolute left-3 top-3">Featured</Badge>}
                      </div>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{tour.country?.name ?? 'Worldwide'}
                        </div>
                        <h3 className="mt-1 font-semibold">{tour.title}</h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-display text-lg font-bold text-primary">${tour.startingPrice ?? 'TBA'}</span>
                          <Button size="sm" variant="ghost" asChild className="gap-1">
                            <Link href={`/tours/${tour.slug}`}>View <ArrowRight className="h-3 w-3" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Events Results */}
          {events.length > 0 && (
            <Reveal>
              <div className="mb-12">
                <h2 className="font-display text-xl font-bold mb-4">Events ({events.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {events.map((event, i) => (
                    <Card key={event.id} className="group overflow-hidden border-border/60 p-0 hover:-translate-y-1 hover:shadow-xl transition-all">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={event.coverUrl || 'https://images.pexels.com/photos/260457/pexels-photo-260457.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <Badge className="absolute left-3 top-3 bg-ocean text-white">{event.eventType}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date TBA'}
                        </div>
                        <h3 className="mt-1 font-semibold">{event.title}</h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-display text-lg font-bold text-primary">${event.startingPrice ?? event.pricePerPerson ?? 'TBA'}</span>
                          <Button size="sm" variant="ghost" asChild className="gap-1">
                            <Link href={`/events/${event.slug}`}>View <ArrowRight className="h-3 w-3" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Destinations Results */}
          {destinations.length > 0 && (
            <Reveal>
              <div className="mb-12">
                <h2 className="font-display text-xl font-bold mb-4">Destinations ({destinations.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {destinations.map((dest, i) => (
                    <Card key={dest.id} className="group overflow-hidden border-border/60 p-0 hover:-translate-y-1 hover:shadow-xl transition-all">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={dest.coverUrl || 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={dest.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-white/90 text-foreground">{dest.country?.name}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{dest.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{dest.shortDescription}</p>
                        <Button size="sm" variant="ghost" className="mt-2 gap-1" asChild>
                          <Link href={`/destinations/${dest.slug}`}>Explore <ArrowRight className="h-3 w-3" /></Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Countries & Cities */}
          {(countries.length > 0 || cities.length > 0) && (
            <Reveal>
              <div className="mb-12">
                <h2 className="font-display text-xl font-bold mb-4">Locations</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {countries.map((country) => (
                    <Link key={country.id} href={`/destinations?country=${country.slug}`} className="group">
                      <Card className="p-4 border-border/60 hover:border-primary/40 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {country.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary">{country.name}</p>
                            <p className="text-xs text-muted-foreground">Country</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                  {cities.map((city) => (
                    <Link key={city.id} href={`/destinations?city=${city.slug}`} className="group">
                      <Card className="p-4 border-border/60 hover:border-primary/40 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-ocean/10 flex items-center justify-center text-ocean font-bold text-sm">
                            {city.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary">{city.name}</p>
                            <p className="text-xs text-muted-foreground">{city.country?.name}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
