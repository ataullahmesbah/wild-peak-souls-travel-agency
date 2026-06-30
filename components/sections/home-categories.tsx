import Link from 'next/link';
import { Mountain, Footprints, Tent, Compass, Camera, Binoculars, Waves, TreePine, Landmark, Bike } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';
import { prisma } from '@/lib/db';

const iconMap: Record<string, any> = {
  trekking: Mountain,
  hiking: Footprints,
  camping: Tent,
  expedition: Compass,
  photography: Camera,
  wildlife: Binoculars,
  water: Waves,
  forest: TreePine,
  cultural: Landmark,
  cycling: Bike,
};

function getIcon(name: string) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(iconMap)) {
    if (lower.includes(key)) return iconMap[key];
  }
  return Compass;
}

export async function HomeCategories() {
  const [tourCategories, eventCategories] = await Promise.all([
    prisma.tourCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { tours: true } } },
      take: 6,
    }),
    prisma.eventCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { events: true } } },
      take: 6,
    }),
  ]);

  const categories = tourCategories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    count: cat._count.tours,
    type: 'tours' as const,
    icon: getIcon(cat.name),
  }));

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Adventure Types"
            title="Find Your Kind of Adventure"
            description="From serene hikes to extreme expeditions, we curate experiences for every level of adventurer."
          />
        </Reveal>

        {categories.length === 0 ? (
          <Reveal delay={100}>
            <div className="text-center py-20">
              <Compass className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No categories available yet. Check back soon.</p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Reveal key={cat.id} delay={i * 60}>
                  <Link href={`/tours?category=${cat.slug}`} className="group block h-full">
                    <Card className="h-full overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{cat.name}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {cat.description ? cat.description.substring(0, 40) + '...' : 'Adventure tours'}
                          </p>
                          <p className="mt-2 text-xs font-medium text-primary">{cat.count} tours</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
