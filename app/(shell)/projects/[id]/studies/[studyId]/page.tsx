'use client';

import { use } from 'react';
import { StudyDetail } from '@/modules/research';

interface StudyPageProps {
  params: Promise<{ id: string; studyId: string }>;
}

export default function StudyPage({ params }: StudyPageProps) {
  const { id, studyId } = use(params);
  return <StudyDetail projectId={id} studyId={studyId} />;
}
