import Link from 'next/link';
import { ArrowRight, BookOpen, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';
import { Reveal } from '@/components/layout/reveal';
import { blogService } from '@/lib/services/blog.service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Wild Peak Souls',
  description: 'Travel stories, adventure guides, and inspiration from explorers around the world.',
  openGraph: {
    title: 'Blog — Wild Peak Souls',
    description: 'Travel stories, adventure guides, and inspiration from explorers around the world.',
  },
};

export default async function BlogPage() {
  const result = await blogService.list({ limit: 24 });
  const posts = result.success && result.data ? result.data.data : [];

  return (
    <>
      <PageHeader
        title="Travel Journal"
        subtitle="Stories, guides, and inspiration from the wild."
      />
      <section className="py-16 lg:py-24">
        <Container>
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No blog posts yet. Stay tuned for adventure stories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={i * 60}>
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <Card className="h-full overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={post.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground shadow-md">
                          {(post as { category?: { name?: string } }).category?.name ?? 'Article'}
                        </Badge>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Coming soon'}</span>
                          <span>·</span>
                          <span>{post.readTimeMinutes ? `${post.readTimeMinutes} min` : '5 min'}</span>
                        </div>
                        <h3 className="mt-2 font-display text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground text-pretty line-clamp-2">
                          {post.excerpt ?? post.content?.substring(0, 150) ?? ''}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          {post.tags?.map((tag, i) => (
                            <span key={i} className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              <Tag className="h-3 w-3" />{tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
