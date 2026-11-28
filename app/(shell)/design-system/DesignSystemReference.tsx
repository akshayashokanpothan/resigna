'use client';

import { useState } from 'react';
import {
  Archive,
  ArrowRight,
  Download,
  Filter,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Settings,
  Share2,
  Trash2,
} from 'lucide-react';
import { Avatar } from '@/shared/components/Avatar';
import { Badge, Tag } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/Card';
import { Checkbox, Radio, RadioGroup, Switch } from '@/shared/components/Choice';
import { Dialog } from '@/shared/components/Dialog';
import { EmptyState } from '@/shared/components/EmptyState';
import { Field } from '@/shared/components/Field';
import { IconButton } from '@/shared/components/IconButton';
import { Illustration, type IllustrationName } from '@/shared/components/Illustration';
import { Input, Select, Textarea } from '@/shared/components/Input';
import { Kbd } from '@/shared/components/Kbd';
import { Logo, LogoSymbol } from '@/shared/components/Logo';
import { Menu } from '@/shared/components/Menu';
import { Notification } from '@/shared/components/Notification';
import { PageHeader } from '@/shared/components/PageHeader';
import { Skeleton, SkeletonCard, SkeletonRow } from '@/shared/components/Skeleton';
import { Tabs } from '@/shared/components/Tabs';
import { Tooltip } from '@/shared/components/Tooltip';
import { cn } from '@/shared/utils/cn';
import { toast } from '@/shared/utils/toast';

/* ── Layout helpers ─────────────────────────────────────────────────────────── */

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-6 border-t border-border pt-10"
    >
      <h2 id={`${id}-title`} className="type-heading-md text-fg">
        {title}
      </h2>
      {description && <p className="mt-1 max-w-3xl type-body text-fg-secondary">{description}</p>}
      <div className="mt-6 flex flex-col gap-8">{children}</div>
    </section>
  );
}

function Specimen({
  title,
  note,
  children,
  className,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline gap-3">
        <h3 className="type-label text-fg">{title}</h3>
        {note && <p className="type-caption text-fg-secondary">{note}</p>}
      </div>
      <div className={cn('rounded-card border border-border bg-surface p-6', className)}>
        {children}
      </div>
    </div>
  );
}

function StateLabel({ children }: { children: React.ReactNode }) {
  return <span className="type-code text-fg-secondary">{children}</span>;
}

function StateGrid({ rows }: { rows: { label: string; node: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-6 gap-y-5">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col items-start gap-2">
          <StateLabel>{r.label}</StateLabel>
          {r.node}
        </div>
      ))}
    </div>
  );
}

/* ── Foundations data ───────────────────────────────────────────────────────── */

const COLOR_GROUPS: {
  title: string;
  tokens: { name: string; value: string; role: string; ratio?: string }[];
}[] = [
  {
    title: 'Layers',
    tokens: [
      { name: 'canvas', value: '#0B0D12', role: 'Page background' },
      { name: 'surface', value: '#11151C', role: 'Panels, cards, sidebar' },
      { name: 'surface-raised', value: '#181D26', role: 'Menus, popovers, raised cards' },
      { name: 'layer-hover', value: '#1C222C', role: 'Hover on any layer' },
      { name: 'layer-selected', value: '#222936', role: 'Selected / pressed' },
    ],
  },
  {
    title: 'Text',
    tokens: [
      { name: 'fg', value: '#F5F7FA', role: 'Primary text', ratio: '18.1:1' },
      { name: 'fg-secondary', value: '#9AA5B1', role: 'Supporting text', ratio: '7.8:1' },
      { name: 'fg-muted', value: '#6B7280', role: 'Placeholder, disabled only', ratio: '4.0:1' },
      { name: 'accent-text', value: '#8B7CFF', role: 'Links, accent copy', ratio: '6.0:1' },
    ],
  },
  {
    title: 'Borders',
    tokens: [
      { name: 'border', value: '#262D39', role: 'Dividers, card edges' },
      { name: 'border-strong', value: '#636D7E', role: 'Control outlines', ratio: '3.7:1' },
    ],
  },
  {
    title: 'Action and signal',
    tokens: [
      { name: 'accent', value: '#6E5CF6', role: 'Primary action, signal', ratio: 'white 4.6:1' },
      {
        name: 'accent-hover',
        value: '#5E4DE8',
        role: 'Primary hover / pressed',
        ratio: 'white 6.0:1',
      },
      { name: 'focus', value: '#8B7CFF', role: 'Focus ring', ratio: '6.0:1' },
    ],
  },
  {
    title: 'Status',
    tokens: [
      { name: 'success', value: '#22C55E', role: 'Success', ratio: '8.5:1' },
      { name: 'warning', value: '#F59E0B', role: 'Warning', ratio: '9.1:1' },
      { name: 'danger', value: '#EF4444', role: 'Error icon / border', ratio: '5.2:1' },
      { name: 'danger-text', value: '#F87171', role: 'Error copy', ratio: '7.0:1' },
      { name: 'danger-solid', value: '#DC2626', role: 'Danger button', ratio: 'white 4.8:1' },
      { name: 'info', value: '#3B82F6', role: 'Info icon / border', ratio: '5.3:1' },
      { name: 'info-text', value: '#60A5FA', role: 'Info copy', ratio: '7.6:1' },
    ],
  },
];

const TYPE_ROLES = [
  { cls: 'type-display', name: 'Display', spec: '32 / 40 · 600' },
  { cls: 'type-heading-lg', name: 'Heading L', spec: '24 / 32 · 600' },
  { cls: 'type-heading-md', name: 'Heading M', spec: '20 / 28 · 600' },
  { cls: 'type-heading-sm', name: 'Heading S', spec: '16 / 24 · 600' },
  { cls: 'type-body', name: 'Body', spec: '14 / 20 · 400' },
  { cls: 'type-body-sm', name: 'Body S', spec: '13 / 18 · 400' },
  { cls: 'type-label', name: 'Label', spec: '12 / 16 · 500' },
  { cls: 'type-caption', name: 'Caption', spec: '12 / 16 · 400' },
  { cls: 'type-overline', name: 'Overline', spec: '11 / 16 · 600 caps' },
  { cls: 'type-code', name: 'Code', spec: 'Plex Mono 12 / 16' },
];

const ILLUSTRATIONS: { group: string; names: IllustrationName[] }[] = [
  {
    group: 'Empty states',
    names: [
      'no-projects',
      'no-research',
      'no-files',
      'no-results',
      'search-empty',
      'workspace-empty',
      'no-internet',
    ],
  },
  {
    group: 'Errors',
    names: [
      'error-404',
      'error-403',
      'error-500',
      'network-error',
      'auth-failed',
      'permission-denied',
    ],
  },
  {
    group: 'Long-running work',
    names: ['processing-documents', 'research-analysis', 'generating-insights', 'ai-thinking'],
  },
];

const NAV = [
  ['foundations', 'Foundations'],
  ['brand', 'Brand assets'],
  ['buttons', 'Buttons'],
  ['forms', 'Form controls'],
  ['status', 'Badges and tags'],
  ['feedback', 'Feedback'],
  ['containers', 'Cards and tabs'],
  ['overlays', 'Overlays'],
  ['states', 'Loading, empty, error'],
] as const;

/* Static stand-ins for interactive states, so they can be reviewed side by side. */
const FORCE_HOVER: Record<string, string> = {
  primary: '!bg-accent-hover',
  secondary: '!bg-layer-hover',
  tertiary: '!bg-accent-subtle',
  ghost: '!bg-layer-hover !text-fg',
  danger: '!bg-danger-solid-hover',
};
const FORCE_FOCUS = 'outline outline-2 outline-offset-2 outline-focus';

/* ── Page ───────────────────────────────────────────────────────────────────── */

export function DesignSystemReference() {
  const [tab, setTab] = useState('sources');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [filters, setFilters] = useState<string[]>(['Interviews']);
  const [tags, setTags] = useState(['Trust', 'Checkout', 'Onboarding']);
  const [showNote, setShowNote] = useState(true);

  const toggleFilter = (f: string) =>
    setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <PageHeader
        eyebrow="Internal"
        title="Design system"
        meta={<Badge tone="accent">v1.0</Badge>}
        description="Tokens, brand assets and every component with its states. Built from the Resigna brand kit v1.0 and the product vision. Dark-first, WCAG 2.2 AA."
      />

      <nav aria-label="Design system sections" className="mb-10 flex flex-wrap gap-2">
        {NAV.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-pill border border-border bg-surface px-3 py-1 text-xs text-fg-secondary transition-colors duration-fast hover:border-border-strong hover:text-fg focus-ring"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-12">
        {/* ── Foundations ── */}
        <Section
          id="foundations"
          title="Foundations"
          description="Semantic tokens map the brand palette to a purpose. Components only use semantic tokens; Tailwind's default palette is switched off. Contrast ratios are against the canvas."
        >
          {COLOR_GROUPS.map((group) => (
            <Specimen key={group.title} title={`Colour · ${group.title}`}>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                {group.tokens.map((t) => (
                  <div
                    key={t.name}
                    className="overflow-hidden rounded-control border border-border"
                  >
                    <div className="h-14" style={{ background: t.value }} aria-hidden="true" />
                    <div className="bg-canvas px-3 py-2">
                      <p className="type-code text-fg">{t.name}</p>
                      <p className="type-caption text-fg-secondary">{t.role}</p>
                      <p className="mt-1 flex justify-between type-code text-fg-secondary">
                        <span>{t.value}</span>
                        {t.ratio && <span>{t.ratio}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Specimen>
          ))}

          <Specimen
            title="Typography"
            note="Inter for UI · IBM Plex Mono for data · Fraunces never in product"
          >
            <div className="divide-y divide-border">
              {TYPE_ROLES.map((r) => (
                <div
                  key={r.cls}
                  className="grid grid-cols-[140px_1fr_160px] items-baseline gap-4 py-3"
                >
                  <span className="type-label text-fg-secondary">{r.name}</span>
                  <span className={cn(r.cls, 'text-fg')}>Evidence-backed design decisions</span>
                  <span className="text-right type-code text-fg-secondary">{r.spec}</span>
                </div>
              ))}
            </div>
          </Specimen>

          <div className="grid gap-8 lg:grid-cols-3">
            <Specimen title="Radius" note="10 · 16 · 20 · pill">
              <div className="flex flex-wrap items-end gap-4">
                {[
                  ['rounded-control', '10 control'],
                  ['rounded-card', '16 card'],
                  ['rounded-dialog', '20 dialog'],
                  ['rounded-pill', 'pill'],
                ].map(([cls, label]) => (
                  <div key={cls} className="flex flex-col items-center gap-2">
                    <div
                      className={cn('size-14 border border-border-strong bg-surface-raised', cls)}
                    />
                    <StateLabel>{label}</StateLabel>
                  </div>
                ))}
              </div>
            </Specimen>
            <Specimen title="Spacing" note="4 px grid">
              <div className="flex flex-col gap-1.5">
                {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((px) => (
                  <div key={px} className="flex items-center gap-3">
                    <span className="w-8 text-right type-code text-fg-secondary">{px}</span>
                    <span className="h-2 rounded-xs bg-accent" style={{ width: px * 2 }} />
                  </div>
                ))}
              </div>
            </Specimen>
            <Specimen title="Motion and elevation" note="150 · 200 · 300 ms, no bounce">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 type-body-sm">
                <dt className="type-code text-fg">fast · 150</dt>
                <dd className="text-fg-secondary">Hover, colour, small toggles</dd>
                <dt className="type-code text-fg">standard · 200</dt>
                <dd className="text-fg-secondary">Menus, dialogs entering</dd>
                <dt className="type-code text-fg">slow · 300</dt>
                <dd className="text-fg-secondary">Large layout changes</dd>
                <dt className="type-code text-fg">raised</dt>
                <dd className="text-fg-secondary">Borders first; 1 px shadow</dd>
                <dt className="type-code text-fg">overlay</dt>
                <dd className="text-fg-secondary">Menus, dialogs, toasts only</dd>
              </dl>
            </Specimen>
          </div>
        </Section>

        {/* ── Brand ── */}
        <Section
          id="brand"
          title="Brand assets"
          description="From the brand kit, unmodified geometry. The symbol is used alone at small sizes; favicons and app icons come from the kit's exports."
        >
          <div className="grid gap-8 md:grid-cols-2">
            <Specimen title="Horizontal lockup" className="flex h-40 items-center justify-center">
              <Logo height={44} />
            </Specimen>
            <Specimen
              title="Symbol · full colour and mono"
              className="flex h-40 items-center justify-center gap-10"
            >
              <LogoSymbol size={64} />
              <LogoSymbol size={40} />
              <LogoSymbol size={24} />
              <span className="text-fg-secondary">
                <LogoSymbol size={40} tone="mono" />
              </span>
            </Specimen>
          </div>
          {ILLUSTRATIONS.map((g) => (
            <Specimen key={g.group} title={`Illustrations · ${g.group}`}>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
                {g.names.map((n) => (
                  <figure
                    key={n}
                    className="flex flex-col items-center gap-2 rounded-control border border-border bg-canvas p-3"
                  >
                    <Illustration name={n} width={130} />
                    <figcaption className="type-code text-fg-secondary">{n}</figcaption>
                  </figure>
                ))}
              </div>
            </Specimen>
          ))}
        </Section>

        {/* ── Buttons ── */}
        <Section
          id="buttons"
          title="Buttons"
          description="One primary action per view. Pending buttons keep their width, set aria-busy and say what is happening; there are no spinners."
        >
          {(['primary', 'secondary', 'tertiary', 'ghost', 'danger'] as const).map((variant) => (
            <Specimen key={variant} title={`Button · ${variant}`}>
              <StateGrid
                rows={[
                  {
                    label: 'default',
                    node: (
                      <Button variant={variant} leadingIcon={Plus}>
                        New project
                      </Button>
                    ),
                  },
                  {
                    label: 'hover',
                    node: (
                      <Button variant={variant} leadingIcon={Plus} className={FORCE_HOVER[variant]}>
                        New project
                      </Button>
                    ),
                  },
                  {
                    label: 'focus',
                    node: (
                      <Button variant={variant} leadingIcon={Plus} className={FORCE_FOCUS}>
                        New project
                      </Button>
                    ),
                  },
                  {
                    label: 'pending',
                    node: (
                      <Button variant={variant} isLoading loadingText="Creating…">
                        New project
                      </Button>
                    ),
                  },
                  {
                    label: 'disabled',
                    node: (
                      <Button variant={variant} leadingIcon={Plus} disabled>
                        New project
                      </Button>
                    ),
                  },
                ]}
              />
            </Specimen>
          ))}
          <div className="grid gap-8 md:grid-cols-2">
            <Specimen title="Sizes" note="sm 28 · md 32 · lg 40">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg" trailingIcon={ArrowRight}>
                  Large
                </Button>
              </div>
            </Specimen>
            <Specimen title="Icon buttons" note="Always labelled; tooltip on hover and focus">
              <div className="flex flex-wrap items-center gap-2">
                <IconButton icon={Search} label="Search" shortcut="⌘K" />
                <IconButton icon={Filter} label="Filter" selected />
                <IconButton icon={Share2} label="Share" variant="secondary" />
                <IconButton icon={Download} label="Export" variant="secondary" />
                <IconButton icon={Plus} label="Add source" variant="primary" />
                <IconButton icon={Settings} label="Settings" disabled />
              </div>
            </Specimen>
          </div>
        </Section>

        {/* ── Forms ── */}
        <Section
          id="forms"
          title="Form controls"
          description="Labels sit above controls. Errors say what is wrong and how to fix it, and are linked to the field for screen readers. Control borders meet the 3:1 non-text contrast rule."
        >
          <Specimen title="Text input">
            <div className="grid gap-6 md:grid-cols-3">
              <Field label="Default" helperText="Shown under the field.">
                <Input placeholder="Checkout redesign" />
              </Field>
              <Field label="Focus">
                <Input
                  defaultValue="Checkout redesign"
                  className="border-focus ring-1 ring-focus"
                />
              </Field>
              <Field label="Invalid" error="Name must be at least 2 characters.">
                <Input defaultValue="C" />
              </Field>
              <Field label="Disabled">
                <Input defaultValue="Checkout redesign" disabled />
              </Field>
              <Field label="Read-only">
                <Input defaultValue="proj_8f2c1a" readOnly className="font-mono" />
              </Field>
              <Field label="With icon" optional>
                <Input leadingIcon={Search} placeholder="Search evidence" />
              </Field>
            </div>
          </Specimen>
          <div className="grid gap-8 md:grid-cols-2">
            <Specimen title="Textarea and select">
              <div className="flex flex-col gap-5">
                <Field label="Research question" helperText="One or two sentences.">
                  <Textarea placeholder="Why do returning shoppers abandon checkout?" />
                </Field>
                <Field label="Method">
                  <Select defaultValue="interview">
                    <option value="interview">Interview</option>
                    <option value="survey">Survey</option>
                    <option value="usability">Usability test</option>
                  </Select>
                </Field>
              </div>
            </Specimen>
            <Specimen title="Checkbox, radio, switch">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <Checkbox label="Checked" defaultChecked />
                  <Checkbox label="Unchecked" />
                  <Checkbox label="Mixed" indeterminate defaultChecked />
                  <Checkbox label="Disabled" disabled />
                  <Checkbox label="Disabled checked" disabled defaultChecked />
                </div>
                <div className="flex flex-col gap-5">
                  <RadioGroup legend="Visibility">
                    <Radio name="vis" label="Workspace" defaultChecked />
                    <Radio name="vis" label="Only me" />
                    <Radio name="vis" label="Public link" disabled />
                  </RadioGroup>
                  <Switch
                    label="Suggest themes"
                    description="Propose themes as evidence comes in."
                    checked={switchOn}
                    onCheckedChange={setSwitchOn}
                  />
                  <Switch label="Disabled" checked={false} onCheckedChange={() => {}} disabled />
                </div>
              </div>
            </Specimen>
          </div>
        </Section>

        {/* ── Status ── */}
        <Section
          id="status"
          title="Badges and tags"
          description="Badges show status and are read-only; the word carries the meaning, colour supports it. Tags are themes, codes and filters."
        >
          <div className="grid gap-8 md:grid-cols-2">
            <Specimen title="Badge tones">
              <div className="flex flex-wrap gap-2">
                <Badge>Draft</Badge>
                <Badge tone="accent">Suggested</Badge>
                <Badge tone="success" dot>
                  Validated
                </Badge>
                <Badge tone="warning" dot>
                  Needs review
                </Badge>
                <Badge tone="danger" dot>
                  Conflicting evidence
                </Badge>
                <Badge tone="info">12 sources</Badge>
              </div>
            </Specimen>
            <Specimen title="Tags" note="Filter chips are toggle buttons (aria-pressed)">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Source type">
                  {['Interviews', 'Surveys', 'Notes', 'Usability tests'].map((f) => (
                    <Tag key={f} selected={filters.includes(f)} onToggle={() => toggleFilter(f)}>
                      {f}
                    </Tag>
                  ))}
                  <Tag disabled onToggle={() => {}}>
                    Recordings
                  </Tag>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <Tag key={t} onRemove={() => setTags((cur) => cur.filter((x) => x !== t))}>
                      {t}
                    </Tag>
                  ))}
                </div>
              </div>
            </Specimen>
          </div>
          <Specimen title="Avatar and keyboard">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Avatar name="Ada Lovelace" size="sm" />
                <Avatar name="Ada Lovelace" />
                <Avatar name="Grace Hopper" size="lg" />
              </div>
              <div className="flex items-center gap-1.5 type-body-sm text-fg-secondary">
                Press <Kbd>⌘</Kbd>
                <Kbd>K</Kbd> to search
              </div>
            </div>
          </Specimen>
        </Section>

        {/* ── Feedback ── */}
        <Section
          id="feedback"
          title="Feedback"
          description="Inline notifications are persistent and tied to their content. Toasts confirm an action and go away."
        >
          <Specimen title="Inline notification">
            <div className="flex flex-col gap-3">
              <Notification tone="info" title="This project is archived">
                It is read-only. Restore it to keep working on it.
              </Notification>
              <Notification
                tone="success"
                title="12 sources processed"
                action={
                  <Button variant="tertiary" size="sm" trailingIcon={ArrowRight}>
                    Review evidence
                  </Button>
                }
              >
                48 observations were extracted and are ready to review.
              </Notification>
              {showNote && (
                <Notification
                  tone="warning"
                  title="Two insights rely on one participant"
                  onDismiss={() => setShowNote(false)}
                >
                  Add evidence from more participants before you share them.
                </Notification>
              )}
              <Notification tone="danger" title="Upload failed">
                transcript-04.docx is larger than 25 MB. Split it or paste the text instead.
              </Notification>
            </div>
          </Specimen>
          <Specimen title="Toast">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => toast.success('Project created')}>
                Success toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.error('Could not save changes. Try again.')}
              >
                Error toast
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  toast.info('Project archived', {
                    description: 'You can restore it from Archived.',
                    action: { label: 'Undo', onClick: () => toast.success('Project restored') },
                  })
                }
              >
                Toast with action
              </Button>
            </div>
          </Specimen>
        </Section>

        {/* ── Containers ── */}
        <Section
          id="containers"
          title="Cards and tabs"
          description="Borders first. Interactive cards highlight on hover and focus-within."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Checkout trust</CardTitle>
                  <CardDescription>Theme · 9 observations</CardDescription>
                </div>
                <Badge tone="success" dot>
                  Validated
                </Badge>
              </CardHeader>
              <p className="type-body text-fg-secondary">
                Shoppers hesitate when the final price changes after they enter their address.
              </p>
              <CardFooter>
                <Button variant="ghost" size="sm">
                  Dismiss
                </Button>
                <Button variant="secondary" size="sm">
                  Review evidence
                </Button>
              </CardFooter>
            </Card>
            <Card interactive>
              <CardHeader>
                <div>
                  <CardTitle>
                    <a
                      href="#containers"
                      className="after:absolute after:inset-0 focus-visible:outline-none"
                    >
                      Interactive card
                    </a>
                  </CardTitle>
                  <CardDescription>Hover or tab to me</CardDescription>
                </div>
                <FolderKanban size={16} className="text-fg-secondary" aria-hidden="true" />
              </CardHeader>
              <p className="type-body text-fg-secondary">
                The whole card is the link&apos;s hit area.
              </p>
            </Card>
            <Card selected layer="raised">
              <CardHeader>
                <div>
                  <CardTitle>Selected card</CardTitle>
                  <CardDescription>Raised layer</CardDescription>
                </div>
              </CardHeader>
              <p className="type-body text-fg-secondary">Accent border marks the selection.</p>
            </Card>
          </div>
          <Specimen title="Tabs" note="← → Home End">
            <Tabs
              label="Project sections"
              value={tab}
              onValueChange={setTab}
              items={[
                { id: 'sources', label: 'Sources', count: 12 },
                { id: 'evidence', label: 'Evidence', count: 48 },
                { id: 'insights', label: 'Insights', count: 6 },
                { id: 'artifacts', label: 'Artifacts', disabled: true },
              ]}
            >
              {(id) => <p className="type-body text-fg-secondary">Panel for “{id}”.</p>}
            </Tabs>
          </Specimen>
        </Section>

        {/* ── Overlays ── */}
        <Section
          id="overlays"
          title="Overlays"
          description="Menus and dialogs trap and return focus, close on Escape, and are fully keyboard operable."
        >
          <Specimen title="Menu, tooltip, dialog">
            <div className="flex flex-wrap items-center gap-3">
              <Menu
                label="Project actions"
                align="start"
                items={[
                  { id: 'edit', label: 'Edit details', icon: Pencil },
                  { id: 'archive', label: 'Archive', icon: Archive },
                  { id: 'share', label: 'Share', icon: Share2, disabled: true },
                  { id: 'delete', label: 'Delete project', icon: Trash2, destructive: true },
                ]}
                trigger={(props) => (
                  <Button {...props} variant="secondary">
                    Open menu
                  </Button>
                )}
              />
              <Tooltip content="Tooltips repeat or add to visible text">
                <Button variant="ghost">Hover or focus me</Button>
              </Tooltip>
              <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
              <Button variant="danger" onClick={() => setDangerOpen(true)}>
                Delete project
              </Button>
            </div>
          </Specimen>
        </Section>

        {/* ── States ── */}
        <Section
          id="states"
          title="Loading, empty, error"
          description="Every screen supports all three. Loading is always a skeleton shaped like the content."
        >
          <div className="grid gap-8 md:grid-cols-2">
            <Specimen title="Skeletons">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-6 w-40" />
                <div className="divide-y divide-border rounded-control border border-border">
                  <SkeletonRow className="px-4" />
                  <SkeletonRow className="px-4" />
                </div>
                <SkeletonCard />
              </div>
            </Specimen>
            <Specimen title="Empty state · compact">
              <EmptyState
                size="compact"
                icon={Search}
                title="No evidence matches “pricing”"
                description="Try a broader term or clear the filters."
                action={
                  <Button variant="secondary" size="sm">
                    Clear filters
                  </Button>
                }
              />
            </Specimen>
          </div>
        </Section>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="New project"
        description="A project holds the research for one study."
      >
        <div className="flex flex-col gap-4">
          <Field label="Name">
            <Input placeholder="Checkout redesign interviews" />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Create project</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={dangerOpen}
        onClose={() => setDangerOpen(false)}
        size="sm"
        title="Delete “Checkout redesign”?"
        description="This deletes 12 sources and 48 observations. You can't undo this."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDangerOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" leadingIcon={Trash2} onClick={() => setDangerOpen(false)}>
            Delete project
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
