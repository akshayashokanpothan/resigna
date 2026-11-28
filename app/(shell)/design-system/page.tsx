import type { Metadata } from 'next';
import { DesignSystemReference } from './DesignSystemReference';

export const metadata: Metadata = {
  title: 'Design system',
};

/**
 * Living reference for the Resigna design system: tokens, brand assets and every component
 * state. Internal page — not in the sidebar; reach it from the command palette (⌘K).
 */
export default function DesignSystemPage() {
  return <DesignSystemReference />;
}
