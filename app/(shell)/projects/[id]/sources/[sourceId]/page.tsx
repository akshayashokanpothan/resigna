'use client';

import { use } from 'react';
import { SourceDetail } from '@/modules/research';

interface SourcePageProps {
  params: Promise<{ id: string; sourceId: string }>;
}

export default function SourcePage({ params }: SourcePageProps) {
  const { id, sourceId } = use(params);
  return <SourceDetail projectId={id} sourceId={sourceId} />;
}
