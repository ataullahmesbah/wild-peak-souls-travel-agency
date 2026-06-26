import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  eyebrow?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  subtitle,
  eyebrow,
  children,
  className,
}: PageHeaderProps) {
  const text = subtitle ?? description;
  return (
    <div
      className={cn(
        'border-b border-border bg-gradient-to-b from-mountain-50/50 to-background dark:from-mountain-900/10',
        className,
      )}
    >
      <div className="container py-16 lg:py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
          )}
          <h1 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {text && (
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              {text}
            </p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}
