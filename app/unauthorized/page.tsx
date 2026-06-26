import Link from 'next/link';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
        <ShieldX className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight">Access Denied</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        You don't have permission to access this page. If you believe this is an error, please contact support.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
