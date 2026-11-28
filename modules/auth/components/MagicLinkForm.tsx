'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MailCheck } from 'lucide-react';
import {
  emailCodeSchema,
  magicLinkSchema,
  type EmailCodeInput,
  type MagicLinkInput,
} from '../schemas/auth.schema';
import { getAuthService } from '../services/auth.service';
import { getAuthErrorMessage } from '../utils/auth-errors';
import { ROUTES } from '@/shared/constants/routes';
import { toast } from '@/shared/utils/toast';
import { safeRedirectPath } from '@/shared/utils/redirect';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Input } from '@/shared/components/Input';

/** Supabase allows one email per address every 60 seconds. */
const RESEND_COOLDOWN_SECONDS = 60;

function getRedirectTarget(): string {
  const from = new URLSearchParams(window.location.search).get('redirectedFrom');
  return safeRedirectPath(from, ROUTES.projects);
}

interface MagicLinkFormProps {
  /** Switch back to email and password. */
  onUsePassword?: () => void;
}

/**
 * Passwordless sign-in: email a one-time link and code.
 * The link signs the user in on any device; the code is for when the email is
 * opened somewhere else (phone) or the link is blocked by a mail scanner.
 */
export function MagicLinkForm({ onUsePassword }: MagicLinkFormProps) {
  const router = useRouter();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const emailForm = useForm<MagicLinkInput>({ resolver: zodResolver(magicLinkSchema) });
  const codeForm = useForm<EmailCodeInput>({ resolver: zodResolver(emailCodeSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const send = async (email: string) => {
    setIsSending(true);
    try {
      await getAuthService().sendMagicLink(email, getRedirectTarget());
      setSentTo(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      return true;
    } catch (error) {
      toast.error(
        getAuthErrorMessage(error, "We couldn't send the email. Please try again."),
        error,
      );
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const onVerify = async ({ code }: EmailCodeInput) => {
    if (!sentTo) return;
    setIsVerifying(true);
    try {
      await getAuthService().verifyEmailCode(sentTo, code);
      router.push(getRedirectTarget());
      router.refresh();
    } catch (error) {
      toast.error(getAuthErrorMessage(error, 'That code didn’t work. Please try again.'), error);
      setIsVerifying(false);
    }
  };

  if (sentTo) {
    return (
      <div className="flex flex-col gap-4">
        <div role="status" className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-card border border-accent-border bg-accent-subtle text-accent-text">
            <MailCheck size={22} aria-hidden="true" />
          </div>
          <div>
            <h3 className="type-heading-sm text-fg">Check your email</h3>
            <p className="mt-1 type-body text-fg-secondary">
              We sent a sign-in link to <span className="font-medium text-fg">{sentTo}</span>. Open
              it on any device, or enter the code from the email below.
            </p>
          </div>
        </div>

        <form onSubmit={codeForm.handleSubmit(onVerify)} className="flex flex-col gap-4" noValidate>
          <Field id="code" label="Code" error={codeForm.formState.errors.code?.message}>
            <Input
              size="lg"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={10}
              placeholder="123456"
              {...codeForm.register('code')}
            />
          </Field>
          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isVerifying}
            loadingText="Signing in…"
          >
            Sign in with code
          </Button>
        </form>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSentTo(null);
              codeForm.reset();
            }}
          >
            Use a different email
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={cooldown > 0 || isSending}
            onClick={() => void send(sentTo)}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={emailForm.handleSubmit(({ email }) => send(email))}
      className="flex flex-col gap-4"
      noValidate
    >
      <Field id="magic-email" label="Email" error={emailForm.formState.errors.email?.message}>
        <Input
          type="email"
          size="lg"
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          {...emailForm.register('email')}
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isSending}
        loadingText="Sending…"
        className="mt-1"
      >
        Email me a sign-in link
      </Button>

      {onUsePassword && (
        <Button variant="ghost" size="sm" onClick={onUsePassword} className="self-center">
          Sign in with a password instead
        </Button>
      )}
    </form>
  );
}
