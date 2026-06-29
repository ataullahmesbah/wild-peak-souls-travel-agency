import Link from 'next/link';
import { Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

interface LogoProps {
  className?: string;
  showText?: boolean;
  compact?: boolean;
}

export function Logo({ className, showText = true, compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2.5', className)}
      aria-label={siteConfig.name}
    >
      <div className={cn(
        "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-mountain-500 to-ocean-600 shadow-md",
        compact ? "h-8 w-8" : "h-9 w-9"
      )}>
        <Mountain className={cn("text-white", compact ? "h-4 w-4" : "h-5 w-5")} strokeWidth={2.5} />
      </div>
      {showText && !compact && (
        <span className="font-display text-lg font-bold tracking-tight">
          Wild Peak
          <span className="text-primary"> Souls</span>
        </span>
      )}
    </Link>
  );
}
