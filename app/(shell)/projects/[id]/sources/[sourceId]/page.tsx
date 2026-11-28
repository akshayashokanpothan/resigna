import { SourceDetail } from '@/modules/research';

/** Static on first visit; see the note in projects/[id]/page.tsx. */
export function generateStaticParams() {
  return [];
}

export default async function SourcePage({
  params,
}: {
  params: Promise<{ id: string; sourceId: string }>;
}) {
  const { id, sourceId } = await params;
  return <SourceDetail projectId={id} sourceId={sourceId} />;
}
