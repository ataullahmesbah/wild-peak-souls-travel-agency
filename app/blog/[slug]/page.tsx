import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';
import { blogService } from '@/lib/services/blog.service';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await blogService.getBySlug(params.slug);
  const post = result.success && result.data ? result.data : null;
  return {
    title: post ? `${post.title} — Blog` : 'Blog Post — Wild Peak Souls',
    description: post?.excerpt ?? 'Read this adventure story on Wild Peak Souls.',
    openGraph: {
      title: post?.title ?? undefined,
      description: post?.excerpt ?? undefined,
      images: post?.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const result = await blogService.getBySlug(params.slug);
  if (!result.success || !result.data) return notFound();
  const post = result.data;

  return (
    <>
      <section className="py-8 border-b border-border/40">
        <Container>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </Container>
      </section>

      {/* Cover */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src={post.coverUrl ?? 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920'}
          alt={post.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        <Container className="relative z-10 flex h-full flex-col justify-end pb-12">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Coming soon'}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTimeMinutes ? `${post.readTimeMinutes} min read` : '5 min read'}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
            {post.title}
          </h1>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="flex items-center gap-2 mb-8">
                {post.tags?.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />{tag}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {post.content ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <p className="text-lg text-muted-foreground">{post.excerpt}</p>
                )}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
