import { ProjectDetailView } from './ProjectDetailView';

/**
 * All project data loads in the browser, so the server output is the same for every project and
 * every user. An empty list makes the route static on first visit (cached on Vercel's edge and
 * prefetched in full by <Link>), instead of a server render on every click.
 */
export function generateStaticParams() {
  return [];
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}
