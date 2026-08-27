import { describe, expect, it } from 'vitest';
import {
  assertSupportedSummernoteVersion,
  isSupportedSummernoteVersion,
} from '../packages/core/src/index';

describe('SNB Core Summernote compatibility contract', () => {
  it('accepts supported Summernote 0.9.x releases starting at 0.9.1', () => {
    expect(isSupportedSummernoteVersion('0.9.1')).toBe(true);
    expect(isSupportedSummernoteVersion('0.9.2')).toBe(true);
    expect(isSupportedSummernoteVersion('0.9.99')).toBe(true);
  });

  it('rejects versions outside the supported range', () => {
    expect(isSupportedSummernoteVersion('0.9.0')).toBe(false);
    expect(isSupportedSummernoteVersion('0.8.20')).toBe(false);
    expect(isSupportedSummernoteVersion('0.10.0')).toBe(false);
    expect(isSupportedSummernoteVersion('1.0.0')).toBe(false);
    expect(isSupportedSummernoteVersion('not-a-version')).toBe(false);
  });

  it('provides a clear assertion failure for unsupported versions', () => {
    expect(() => assertSupportedSummernoteVersion('0.10.0')).toThrow(
      'Unsupported Summernote version "0.10.0". Expected >=0.9.1 <0.10.0.',
    );
  });
});
