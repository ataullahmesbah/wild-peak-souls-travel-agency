"use client";

import { Heart } from "lucide-react";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card px-4 py-3 lg:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>
          &copy; {currentYear} Wild Peak Souls. All rights reserved.
        </p>
        <div className="flex items-center gap-1">
          <span>Made with</span>
          <Heart className="h-3 w-3 text-destructive fill-destructive" />
          <span>for adventure seekers</span>
        </div>
      </div>
    </footer>
  );
}
