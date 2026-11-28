import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

type Tone = 'info' | 'success' | 'warning' | 'danger';

const toneStyles: Record<
  Tone,
  { icon: typeof Info; border: string; iconColor: string; label: string }
> = {
  info: { icon: Info, border: 'border-l-info', iconColor: 'text-info-text', label: 'Information' },
  success: {
    icon: CheckCircle2,
    border: 'border-l-success',
    iconColor: 'text-success-text',
    label: 'Success',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-l-warning',
    iconColor: 'text-warning-text',
    label: 'Warning',
  },
  danger: {
    icon: AlertCircle,
    border: 'border-l-danger',
    iconColor: 'text-danger-text',
    label: 'Error',
  },
};

interface NotificationProps {
  tone?: Tone;
  title: string;
  children?: React.ReactNode;
  /** An action, usually a ghost or tertiary <Button>. */
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Inline notification — persistent, in-page feedback tied to the content around it.
 * Errors and warnings use role="alert" (announced at once); info and success use role="status".
 * For short-lived confirmation after an action, use a toast (shared/utils/toast.ts).
 */
export function Notification({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  className,
}: NotificationProps) {
  const { icon: Icon, border, iconColor, label } = toneStyles[tone];
  const urgent = tone === 'danger' || tone === 'warning';
  return (
    <div
      role={urgent ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-control border border-border border-l-[3px] bg-surface px-4 py-3',
        border,
        className,
      )}
    >
      <Icon size={16} className={cn('mt-0.5 shrink-0', iconColor)} role="img" aria-label={label} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">{title}</p>
        {children && <div className="mt-0.5 type-body-sm text-fg-secondary">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="-mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-fg-secondary transition-colors duration-fast hover:bg-layer-hover hover:text-fg focus-ring"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
