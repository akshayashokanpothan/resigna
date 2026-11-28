import type { Metadata } from 'next';
import { PageHeader } from '@/shared/components/PageHeader';
import { SettingsTabs } from './SettingsTabs';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <PageHeader title="Settings" description="Manage your account and workspace preferences." />
      <SettingsTabs />
    </div>
  );
}
