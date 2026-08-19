import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BrickRegistry,
  createSummernoteBricksPlugin,
  registerSummernoteBricks,
  type JQueryLike,
  type SummernoteContext,
  type SummernoteUi,
} from '../src/index';

function fakeUi(): SummernoteUi {
  return {
    button(options) {
      return { render: () => ({ kind: 'button', options }) };
    },
    dropdown(options) {
      return { kind: 'dropdown', options };
    },
    buttonGroup(children) {
      return { render: () => ({ kind: 'group', children }) };
    },
  };
}

function fakeJquery(): JQueryLike {
  return {
    extend(target, ...sources) {
      return Object.assign(target, ...sources);
    },
    summernote: {
      plugins: {},
      ui: fakeUi(),
    },
  };
}

function contextWithButtons(buttons: Record<string, unknown>, options: Record<string, unknown> = {}): SummernoteContext {
  const memos = new Map<string, unknown>();
  Object.entries(buttons).forEach(([name, value]) => memos.set(`button.${name}`, value));
  return {
    options,
    memo(key, value) {
      if (arguments.length === 2) {
        memos.set(key, value);
        return value;
      }
      return memos.get(key);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BrickRegistry', () => {
  it('resolves aliases and keeps direct Summernote button names unchanged', () => {
    const registry = new BrickRegistry({ gallery: 'summernoteGallery' });
    expect(registry.resolve('gallery')).toBe('summernoteGallery');
    expect(registry.resolve('thirdPartyButton')).toBe('thirdPartyButton');
  });

  it('rejects empty aliases and button names', () => {
    const registry = new BrickRegistry();
    expect(() => registry.register('', 'summernoteGallery')).toThrow(TypeError);
    expect(() => registry.register('gallery', '')).toThrow(TypeError);
  });
});

describe('Summernote Bricks plugin', () => {
  it('composes already-registered child button memos', () => {
    const jquery = fakeJquery();
    const plugin = createSummernoteBricksPlugin(jquery, {
      subBricks: ['summernote-heading', 'custom'],
      brickAliases: { custom: 'thirdParty' },
    });
    const context = contextWithButtons({
      summernoteHeading: () => ({ id: 'heading' }),
      thirdParty: () => ({ id: 'custom' }),
    });

    plugin.summernoteBricks?.(context);
    const factory = context.memo('button.summernoteBricks') as () => { kind: string; children: unknown[] };
    const rendered = factory();

    expect(rendered.kind).toBe('group');
    expect(rendered.children).toHaveLength(2);
  });

  it('fails clearly when a configured child plugin was not registered', () => {
    const jquery = fakeJquery();
    const plugin = createSummernoteBricksPlugin(jquery, { subBricks: ['summernote-gallery'] });
    const context = contextWithButtons({});
    plugin.summernoteBricks?.(context);
    const factory = context.memo('button.summernoteBricks') as () => unknown;
    expect(factory).toThrow(/summernoteGallery/);
  });

  it('registers through Summernote plugins without replacing $.fn.summernote', () => {
    const jquery = fakeJquery();
    registerSummernoteBricks(jquery);
    expect(jquery.summernote?.plugins.summernoteBricks).toBeTypeOf('function');
  });

  it('can register before Summernote UI is populated and resolve UI at plugin initialization', () => {
    const jquery: JQueryLike = {
      extend(target, ...sources) {
        return Object.assign(target, ...sources);
      },
      summernote: { plugins: {} },
    };

    registerSummernoteBricks(jquery);
    expect(jquery.summernote?.plugins.summernoteBricks).toBeTypeOf('function');

    jquery.summernote!.ui = fakeUi();
    const plugin = jquery.summernote!.plugins.summernoteBricks as (context: SummernoteContext) => void;
    const context = contextWithButtons({});
    expect(() => plugin(context)).not.toThrow();
    expect(context.memo('button.summernoteBricks')).toBeTypeOf('function');
  });

  it('auto-registers when the browser artifact is loaded after the Summernote plugin registry exists', async () => {
    const jquery: JQueryLike = {
      extend(target, ...sources) {
        return Object.assign(target, ...sources);
      },
      summernote: { plugins: {} },
    };
    vi.stubGlobal('jQuery', jquery);
    vi.resetModules();

    await import('../src/index');

    expect(jquery.summernote?.plugins.summernoteBricks).toBeTypeOf('function');
  });
});
