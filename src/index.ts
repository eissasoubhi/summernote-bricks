export interface SummernoteContext {
  options: Record<string, unknown>;
  memo(key: string, value?: unknown): unknown;
}

export interface SummernoteUi {
  button(options: Record<string, unknown>): { render(): unknown };
  buttonGroup(children: unknown[]): { render(): unknown };
  dropdown(options: Record<string, unknown>): unknown;
}

export interface JQueryLike {
  extend<T extends object>(target: T, ...sources: object[]): T;
  summernote?: {
    ui?: SummernoteUi;
    plugins: Record<string, unknown>;
  };
}

export interface BricksPluginToggleOptions {
  enabled?: boolean;
  buttonName?: string;
}

export type BricksPluginToggle = boolean | BricksPluginToggleOptions;

export interface BricksOptions {
  name: string;
  buttonLabel: string;
  tooltip: string;
  subBricks: string[];
  brickAliases: Record<string, string>;
  plugins: Record<string, BricksPluginToggle>;
}

export type SummernotePluginConstructor = new (context: SummernoteContext) => object;

const DEFAULT_ALIASES: Record<string, string> = {
  'summernote-gallery': 'summernoteGallery',
  'summernote-heading': 'summernoteHeading',
};

const DEFAULT_OPTIONS: BricksOptions = {
  name: 'summernoteBricks',
  buttonLabel: '<i class="fa fa-puzzle-piece"></i> SN bricks',
  tooltip: 'Summernote bricks',
  subBricks: [],
  brickAliases: {},
  plugins: {},
};

export class BrickRegistry {
  private readonly aliases = new Map<string, string>();

  constructor(aliases: Record<string, string> = {}) {
    Object.entries(aliases).forEach(([name, buttonName]) => this.register(name, buttonName));
  }

  register(name: string, buttonName: string): this {
    if (!name.trim()) throw new TypeError('A brick alias must be a non-empty string.');
    if (!buttonName.trim()) {
      throw new TypeError(`Brick "${name}" must reference a non-empty Summernote button name.`);
    }
    this.aliases.set(name, buttonName);
    return this;
  }

  has(name: string): boolean {
    return this.aliases.has(name);
  }

  resolve(name: string): string {
    return this.aliases.get(name) ?? name;
  }

  names(): string[] {
    return [...this.aliases.keys()];
  }
}

export class BrickButtonLoader {
  constructor(private readonly registry = new BrickRegistry(DEFAULT_ALIASES)) {}

  register(name: string, buttonName: string): this {
    this.registry.register(name, buttonName);
    return this;
  }

  load(context: SummernoteContext, name: string): unknown {
    const buttonName = this.registry.resolve(name);
    const memo = context.memo(`button.${buttonName}`);
    if (!memo) {
      throw new Error(
        `Summernote brick "${name}" requires the "${buttonName}" button to be registered before editor initialization.`,
      );
    }
    return typeof memo === 'function' ? (memo as () => unknown)() : memo;
  }
}

function mergedOptions(context: SummernoteContext, configured: Partial<BricksOptions>): BricksOptions {
  const contextOptions = context.options[configured.name ?? DEFAULT_OPTIONS.name];
  const local = contextOptions && typeof contextOptions === 'object' ? contextOptions : {};
  return {
    ...DEFAULT_OPTIONS,
    ...configured,
    ...local,
    brickAliases: {
      ...DEFAULT_OPTIONS.brickAliases,
      ...(configured.brickAliases ?? {}),
      ...((local as Partial<BricksOptions>).brickAliases ?? {}),
    },
    plugins: {
      ...DEFAULT_OPTIONS.plugins,
      ...(configured.plugins ?? {}),
      ...((local as Partial<BricksOptions>).plugins ?? {}),
    },
  };
}

function configuredBrickNames(options: BricksOptions, loader: BrickButtonLoader): string[] {
  const names = [...options.subBricks];

  Object.entries(options.plugins).forEach(([name, toggle]) => {
    const enabled = typeof toggle === 'boolean' ? toggle : toggle.enabled !== false;

    if (typeof toggle === 'object' && toggle.buttonName) {
      loader.register(name, toggle.buttonName);
    }

    const existingIndex = names.indexOf(name);
    if (!enabled) {
      if (existingIndex >= 0) names.splice(existingIndex, 1);
      return;
    }

    if (existingIndex < 0) names.push(name);
  });

  return names;
}

export function createSummernoteBricksPlugin(
  jquery: JQueryLike,
  configured: Partial<BricksOptions> = {},
): Record<string, SummernotePluginConstructor> {
  const name = configured.name ?? DEFAULT_OPTIONS.name;
  const loader = new BrickButtonLoader();

  class SummernoteBricksPlugin {
    constructor(context: SummernoteContext) {
      const ui = jquery.summernote?.ui;
      if (!ui) {
        throw new Error('Summernote UI must be available when Summernote Bricks initializes.');
      }

      context.memo(`button.${name}`, () => {
        const options = mergedOptions(context, configured);
        Object.entries(options.brickAliases).forEach(([alias, buttonName]) => loader.register(alias, buttonName));
        const components = configuredBrickNames(options, loader).map((brick) => loader.load(context, brick));
        return ui.buttonGroup([
          ui.button({
            className: 'dropdown-toggle',
            contents: options.buttonLabel,
            tooltip: options.tooltip,
            data: { toggle: 'dropdown' },
          }),
          ui.dropdown({
            contents: components,
            className: 'dropdown-style',
          }),
        ]).render();
      });
    }
  }

  return { [name]: SummernoteBricksPlugin };
}

export function registerSummernoteBricks(
  jquery: JQueryLike,
  configured: Partial<BricksOptions> = {},
): void {
  if (!jquery.summernote) throw new Error('Summernote must be loaded before Summernote Bricks.');
  Object.assign(jquery.summernote.plugins, createSummernoteBricksPlugin(jquery, configured));
}

function detectBrowserJQuery(): JQueryLike | undefined {
  const globals = globalThis as typeof globalThis & {
    jQuery?: JQueryLike;
    $?: JQueryLike;
  };
  return globals.jQuery ?? globals.$;
}

// Script-tag builds register as soon as Summernote's plugin registry exists.
// Summernote 0.9.x may populate $.summernote.ui later, during editor setup, so
// UI access is deliberately deferred until the plugin instance initializes.
const browserJQuery = detectBrowserJQuery();
if (browserJQuery?.summernote) {
  registerSummernoteBricks(browserJQuery);
}
