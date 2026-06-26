import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/layout/section-heading';
import { Reveal } from '@/components/layout/reveal';
import { blogService } from '@/lib/services/blog.service';

interface BlogCardView {
  slug: string;
  title: string;
  categoryName: string;
  imageUrl: string;
  excerpt: string;
  author: string;
  dateDisplay: string;
  readTimeDisplay: string;
}

function toView(post: any): BlogCardView {
  return {
    slug: post.slug,
    title: post.title,
    categoryName: post.category?.name ?? post.category ?? 'Article',
    imageUrl: post.coverUrl ?? post.image ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=600',
    excerpt: post.excerpt ?? post.content?.substring(0, 150) ?? '',
    author: post.author ?? 'Wild Peak Team',
    dateDisplay: post.date ?? (post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Coming soon'),
    readTimeDisplay: post.readTimeMinutes ? `${post.readTimeMinutes} min` : post.readingTime ?? '5 min',
  };
}

const fallbackPosts = [
  { title: 'Conquering Everest Base Camp: A Complete Guide', category: 'Trekking', excerpt: 'Everything you need to know before embarking on the journey of a lifetime to Everest Base Camp.', image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=600', author: 'Sarah Mitchell', date: 'Jun 12, 2026', readingTime: '8 min', slug: 'conquering-everest-base-camp' },
  { title: '10 Essential Camping Tips for Beginners', category: 'Camping', excerpt: 'Master the outdoors with these expert camping tips that every adventurer should know.', image: 'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&w=600', author: 'James Chen', date: 'Jun 8, 2026', readingTime: '6 min', slug: 'essential-camping-tips-beginners' },
  { title: 'Photographing the Northern Lights: Pro Tips', category: 'Photography', excerpt: 'Capture the aurora borealis like a professional with these camera settings and location guides.', image: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=600', author: 'Elena Rodriguez', date: 'Jun 3, 2026', readingTime: '7 min', slug: 'photographing-northern-lights-pro-tips' },
];

export async function HomeBlog() {
  const result = await blogService.list({ limit: 3 });
  const rawPosts = result.success && result.data?.data.length ? result.data.data : fallbackPosts;
  const posts = rawPosts.map(toView);

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-mountain-50/30 dark:to-mountain-900/5">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="Travel Journal"
              title="Stories & Guides"
              description="Expert tips, adventure stories, and travel inspiration from the wild."
              className="sm:max-w-xl"
            />
            <Button variant="outline" asChild className="gap-2 shrink-0">
              <Link href="/blog">Read All <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 100}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <Card className="h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground shadow-md">{post.categoryName}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.dateDisplay}</span>
                      <span>·</span>
                      <span>{post.readTimeDisplay}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug transition-colors group-hover:text-primary">{post.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground text-pretty line-clamp-2">{post.excerpt}</p>
                    <div className="mt-4 text-xs text-muted-foreground">By {post.author}</div>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
