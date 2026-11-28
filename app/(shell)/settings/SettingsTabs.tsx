'use client';

import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { Tabs, type TabItem } from '@/shared/components/Tabs';

const TABS: TabItem[] = [
  { id: 'account', label: 'Account' },
  { id: 'workspace', label: 'Workspace', disabled: true },
  { id: 'integrations', label: 'Integrations', disabled: true },
  { id: 'billing', label: 'Billing', disabled: true },
];

export function SettingsTabs() {
  const [tab, setTab] = useState('account');
  return (
    <Tabs label="Settings sections" items={TABS} value={tab} onValueChange={setTab}>
      {() => (
        <Card padding="none">
          <EmptyState
            size="compact"
            icon={UserRound}
            title="Account settings are coming soon"
            description="You'll manage your name, email, password and sign-in methods here."
          />
        </Card>
      )}
    </Tabs>
  );
}
