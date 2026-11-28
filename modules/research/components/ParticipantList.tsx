'use client';

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';
import { IconButton } from '@/shared/components/IconButton';
import { Menu } from '@/shared/components/Menu';
import { CONSENT_META } from '../domain/research.domain';
import type { Participant, ResearchSourceSummary } from '../types/research.types';

interface ParticipantListProps {
  participants: Participant[];
  sources: ResearchSourceSummary[];
  onEdit: (participant: Participant) => void;
  onPurge: (participant: Participant) => void;
}

export function ParticipantList({ participants, sources, onEdit, onPurge }: ParticipantListProps) {
  return (
    <ul role="list" aria-label="Participants" className="flex flex-col">
      {participants.map((participant) => {
        const consent = CONSENT_META[participant.consentStatus];
        const count = sources.filter((s) => s.participantId === participant.id).length;
        const attributes = Object.entries(participant.attributes);
        return (
          <li
            key={participant.id}
            className="flex items-start gap-4 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div
              aria-hidden="true"
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised font-mono text-xs font-medium text-fg-secondary"
            >
              {participant.label.slice(0, 3)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium text-fg">{participant.label}</span>
                <Badge tone={consent.tone} dot>
                  {consent.label}
                </Badge>
              </span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 type-caption text-fg-secondary">
                <span>
                  {count} {count === 1 ? 'source' : 'sources'}
                </span>
                {attributes.map(([key, value]) => (
                  <span key={key}>
                    {key}: <span className="text-fg">{value}</span>
                  </span>
                ))}
              </span>
              {participant.consentNotes && (
                <span className="line-clamp-2 type-caption text-fg-secondary">
                  {participant.consentNotes}
                </span>
              )}
            </div>
            <Menu
              label={`Actions for ${participant.label}`}
              align="end"
              items={[
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: Pencil,
                  onSelect: () => onEdit(participant),
                },
                {
                  id: 'purge',
                  label: 'Delete with all data',
                  icon: Trash2,
                  destructive: true,
                  onSelect: () => onPurge(participant),
                },
              ]}
              trigger={(props) => (
                <IconButton
                  {...props}
                  icon={MoreHorizontal}
                  label={`Actions for ${participant.label}`}
                  tooltipSide="left"
                />
              )}
            />
          </li>
        );
      })}
    </ul>
  );
}
