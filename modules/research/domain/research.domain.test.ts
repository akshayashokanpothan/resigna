import { describe, expect, it } from 'vitest';
import {
  checkSourceFile,
  countWords,
  emptyToNull,
  formatAttributes,
  formatDay,
  guessSourceType,
  ilikePattern,
  isTextFile,
  nextParticipantLabel,
  parseAttributes,
  parseResearchQuestions,
  postgrestOrIlike,
  searchSnippet,
  sourceStoragePath,
  splitByMatch,
  titleFromFilename,
  MAX_SOURCE_FILE_BYTES,
} from './research.domain';

describe('parseResearchQuestions', () => {
  it('keeps one question per line and drops blanks and list markers', () => {
    expect(
      parseResearchQuestions('- Why do they leave?\n\n2. What builds trust?\n  * How often?  '),
    ).toEqual(['Why do they leave?', 'What builds trust?', 'How often?']);
  });
  it('handles empty input', () => {
    expect(parseResearchQuestions('')).toEqual([]);
    expect(parseResearchQuestions(undefined)).toEqual([]);
  });
});

describe('participant attributes', () => {
  it('parses "key: value" lines and round-trips', () => {
    const parsed = parseAttributes('Role: Nurse\nnot an attribute\nShift: Night: weekends\n:empty');
    expect(parsed).toEqual({ Role: 'Nurse', Shift: 'Night: weekends' });
    expect(parseAttributes(formatAttributes(parsed))).toEqual(parsed);
  });
});

describe('emptyToNull', () => {
  it('turns blank strings into null and trims the rest', () => {
    expect(emptyToNull('  ')).toBeNull();
    expect(emptyToNull(undefined)).toBeNull();
    expect(emptyToNull(' a ')).toBe('a');
  });
});

describe('source files', () => {
  it('accepts supported files and rejects others', () => {
    expect(checkSourceFile({ name: 'P01.vtt', size: 10 })).toEqual({ ok: true });
    expect(checkSourceFile({ name: 'notes.DOCX', size: 10 })).toEqual({ ok: true });
    expect(checkSourceFile({ name: 'clip.mp4', size: 10 }).ok).toBe(false);
    expect(checkSourceFile({ name: 'a.txt', size: 0 }).ok).toBe(false);
    expect(checkSourceFile({ name: 'a.txt', size: MAX_SOURCE_FILE_BYTES + 1 }).ok).toBe(false);
  });

  it('knows which files can be read as text in the browser', () => {
    expect(isTextFile('a.md')).toBe(true);
    expect(isTextFile('a.srt')).toBe(true);
    expect(isTextFile('a.pdf')).toBe(false);
  });

  it('guesses a sensible type and title', () => {
    expect(guessSourceType('call.vtt')).toBe('interview_transcript');
    expect(guessSourceType('Interview P03.txt')).toBe('interview_transcript');
    expect(guessSourceType('survey.csv')).toBe('spreadsheet');
    expect(guessSourceType('brief.pdf')).toBe('document');
    expect(guessSourceType('thoughts.md')).toBe('notes');
    expect(titleFromFilename('interview_p03-final.txt')).toBe('interview p03 final');
    expect(titleFromFilename('.txt')).toBe('.txt');
  });

  it('builds a storage path that starts with the project id and is URL safe', () => {
    expect(sourceStoragePath('proj', 'src', 'Interview – P03 (final)!.TXT')).toBe(
      'proj/src/interview-p03-final.txt',
    );
    expect(sourceStoragePath('proj', 'src', '数据.pdf')).toBe('proj/src/file.pdf');
  });
});

describe('countWords', () => {
  it('counts whitespace-separated words', () => {
    expect(countWords('  one two\nthree  ')).toBe(3);
    expect(countWords('')).toBe(0);
    expect(countWords(null)).toBe(0);
  });
});

describe('search helpers', () => {
  it('escapes ILIKE wildcards', () => {
    expect(ilikePattern('50%_off\\')).toBe('%50\\%\\_off\\\\%');
  });

  it('quotes PostgREST or= values so commas and parentheses are literal', () => {
    expect(postgrestOrIlike(['title', 'goal'], 'a,b (c)')).toBe(
      'title.ilike."%a,b (c)%",goal.ilike."%a,b (c)%"',
    );
    expect(postgrestOrIlike(['title'], 'say "hi"')).toBe('title.ilike."%say \\"hi\\"%"');
  });

  it('makes a short snippet around the match', () => {
    const text = `${'a '.repeat(100)}the padlock icon${' b'.repeat(100)}`;
    const snippet = searchSnippet(text, 'PADLOCK', 10);
    expect(snippet).toMatch(/^….*padlock.*…$/);
    expect(searchSnippet('nothing here', 'padlock')).toBeNull();
  });

  it('splits text for highlighting, case-insensitively', () => {
    expect(splitByMatch('Trust and trust', 'trust')).toEqual([
      { text: 'Trust', match: true },
      { text: ' and ', match: false },
      { text: 'trust', match: true },
    ]);
  });
});

describe('nextParticipantLabel', () => {
  it('picks the first free code', () => {
    expect(nextParticipantLabel([])).toBe('P01');
    expect(nextParticipantLabel(['P01', 'p02', 'P04'])).toBe('P03');
  });
});

describe('formatDay', () => {
  it('formats a calendar date without shifting it a day', () => {
    expect(formatDay('2026-11-28')).toBe('Nov 28, 2026');
  });
});
