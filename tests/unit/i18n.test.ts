import { describe, expect, it as test } from 'vitest';
import { detectLang, t } from '../../src/core/i18n';

describe('detectLang', () => {
  test('maps it* navigator languages to it', () => {
    expect(detectLang('it-IT')).toBe('it');
    expect(detectLang('it')).toBe('it');
  });

  test('maps everything else to en', () => {
    expect(detectLang('en-US')).toBe('en');
    expect(detectLang('fr-FR')).toBe('en');
    expect(detectLang('de')).toBe('en');
  });

  test('an explicit override wins over navigator.language', () => {
    expect(detectLang('it-IT', 'en')).toBe('en');
    expect(detectLang('en-US', 'it')).toBe('it');
  });
});

describe('t', () => {
  test('resolves a key in the requested language', () => {
    expect(t('welcome.title', 'it')).toBe('Benvenuto su socialmerd');
    expect(t('welcome.title', 'en')).toBe('Welcome to socialmerd');
  });
});
