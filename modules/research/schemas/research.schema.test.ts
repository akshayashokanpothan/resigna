import { describe, expect, it } from 'vitest';
import { participantFormSchema, pasteSourceSchema, studyFormSchema } from './research.schema';

const study = {
  title: 'Checkout interviews',
  goal: '',
  researchQuestions: '',
  methods: [],
  status: 'planned' as const,
  startsOn: '',
  endsOn: '',
};

describe('studyFormSchema', () => {
  it('accepts a minimal study', () => {
    expect(studyFormSchema.safeParse(study).success).toBe(true);
  });
  it('requires a title', () => {
    expect(studyFormSchema.safeParse({ ...study, title: '  ' }).success).toBe(false);
  });
  it('rejects an end date before the start date', () => {
    const result = studyFormSchema.safeParse({
      ...study,
      startsOn: '2026-12-02',
      endsOn: '2026-12-01',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['endsOn']);
  });
  it('rejects unknown methods', () => {
    expect(studyFormSchema.safeParse({ ...study, methods: ['focus_group'] }).success).toBe(false);
  });
});

describe('participantFormSchema', () => {
  it('requires a label and a known consent status', () => {
    expect(
      participantFormSchema.safeParse({ label: 'P01', consentStatus: 'granted' }).success,
    ).toBe(true);
    expect(participantFormSchema.safeParse({ label: '', consentStatus: 'granted' }).success).toBe(
      false,
    );
    expect(participantFormSchema.safeParse({ label: 'P01', consentStatus: 'maybe' }).success).toBe(
      false,
    );
  });
});

describe('pasteSourceSchema', () => {
  const base = { title: 'P01', sourceType: 'notes' as const, isSensitive: false };
  it('requires some text', () => {
    expect(pasteSourceSchema.safeParse({ ...base, contentText: '   ' }).success).toBe(false);
    expect(pasteSourceSchema.safeParse({ ...base, contentText: 'Hello' }).success).toBe(true);
  });
});
