'use client';

import { Suspense } from 'react';
import { ResearchSearch } from '@/modules/research';
import { PageHeader } from '@/shared/components/PageHeader';

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <PageHeader
        title="Research"
        description="Search everything you've collected across your projects: studies, transcripts, notes and documents."
      />
      <Suspense>
        <ResearchSearch />
      </Suspense>
    </div>
  );
}
