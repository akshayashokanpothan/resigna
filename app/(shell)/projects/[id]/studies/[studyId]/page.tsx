import { StudyDetail } from '@/modules/research';

/** Static on first visit; see the note in projects/[id]/page.tsx. */
export function generateStaticParams() {
  return [];
}

export default async function StudyPage({
  params,
}: {
  params: Promise<{ id: string; studyId: string }>;
}) {
  const { id, studyId } = await params;
  return <StudyDetail projectId={id} studyId={studyId} />;
}
