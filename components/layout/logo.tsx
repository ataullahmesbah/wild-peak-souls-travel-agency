import Link from 'next/link';
import { Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2.5', className)}
      aria-label={siteConfig.name}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mountain-500 to-ocean-600 shadow-md">
        <Mountain className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight">
          Wild Peak
          <span className="text-primary"> Souls</span>
        </span>
      )}
    </Link>
  );
}
