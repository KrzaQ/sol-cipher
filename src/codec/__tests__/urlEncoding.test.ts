import { describe, it, expect } from 'vitest';
import { passwordToUrl, urlToPassword } from '../urlEncoding';
import { ALL_PASSWORDS } from './passwords';

const UNSAFE_RE = /[#%+=&$!?]/;

describe('URL encoding', () => {
  it.each(ALL_PASSWORDS.map((pw, i) => [i, pw]))(
    'round-trips password #%i through URL encoding',
    (_i, pw) => {
      expect(urlToPassword(passwordToUrl(pw as string))).toBe(pw);
    },
  );

  it.each(ALL_PASSWORDS.map((pw, i) => [i, pw]))(
    'password #%i URL form contains no unsafe chars',
    (_i, pw) => {
      expect(passwordToUrl(pw as string)).not.toMatch(UNSAFE_RE);
    },
  );

  it('substitutes all 8 special chars correctly', () => {
    const input = '#%+=&$!?';
    expect(passwordToUrl(input)).toBe('01IOlo-_');
  });

  it('reverse-substitutes all 8 URL chars correctly', () => {
    const input = '01IOlo-_';
    expect(urlToPassword(input)).toBe('#%+=&$!?');
  });

  it('passes through safe alphabet chars unchanged', () => {
    const safe = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    expect(passwordToUrl(safe)).toBe(safe);
  });

  it('preserves password length', () => {
    for (const pw of ALL_PASSWORDS) {
      expect(passwordToUrl(pw)).toHaveLength(pw.length);
    }
  });
});
