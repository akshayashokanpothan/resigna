import { APP_TAGLINE } from '@/shared/constants/app.constants';
import { cn } from '@/shared/utils/cn';
import { LogoSymbol } from '@/shared/components/Logo';

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoSymbol size={40} />
        <p className="mt-4 text-2xl font-medium tracking-[-0.04em] text-fg">Resigna</p>
        <p className="mt-1 type-body text-fg-secondary">{APP_TAGLINE}</p>
      </div>

      <div className="rounded-card border border-border bg-surface p-6">
        <div className="mb-5">
          <h1 className="type-heading-sm text-fg">{title}</h1>
          <p className="mt-0.5 type-body-sm text-fg-secondary">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
