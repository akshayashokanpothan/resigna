import { APP_NAME, APP_TAGLINE } from '@/shared/constants/app.constants';
import { cn } from '@/shared/utils/cn';

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div className={cn('w-full max-w-sm', className)}>
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          {APP_NAME}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{APP_TAGLINE}</p>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-medium text-[hsl(var(--foreground))]">{title}</h2>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
