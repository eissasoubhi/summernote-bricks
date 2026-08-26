import { describe, expect, it } from 'vitest';
import { PluginRegistry, definePlugin } from '../packages/core/src/index';

describe('SNB Core plugin contract', () => {
  it('registers and resolves a plugin without owning feature behavior', () => {
    const registry = new PluginRegistry();
    const plugin = definePlugin({
      name: 'summernote-heading',
      install() {},
    });

    registry.register(plugin);

    expect(registry.has('summernote-heading')).toBe(true);
    expect(registry.get('summernote-heading')).toBe(plugin);
    expect(registry.list()).toEqual([plugin]);
  });

  it('rejects duplicate plugin names', () => {
    const registry = new PluginRegistry();
    const plugin = definePlugin({ name: 'summernote-gallery', install() {} });

    registry.register(plugin);

    expect(() => registry.register(plugin)).toThrow(
      'Bricks plugin "summernote-gallery" is already registered.',
    );
  });

  it('rejects empty plugin names', () => {
    const registry = new PluginRegistry();

    expect(() =>
      registry.register(definePlugin({ name: '   ', install() {} })),
    ).toThrow('A Bricks plugin must have a non-empty name.');
  });
});
