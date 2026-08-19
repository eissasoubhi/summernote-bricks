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
    ui: SummernoteUi;
    plugins: Record<string, unknown>;
  };
}

export interface BricksOptions {
  name: string;
  buttonLabel: string;
  tooltip: string;
  subBricks: string[];
  brickAliases: Record<string, string>;
}

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
  };
}

export function createSummernoteBricksPlugin(
  jquery: JQueryLike,
  configured: Partial<BricksOptions> = {},
): Record<string, (context: SummernoteContext) => void> {
  if (!jquery.summernote?.ui) {
    throw new Error('Summernote UI must be loaded before Summernote Bricks is registered.');
  }

  const name = configured.name ?? DEFAULT_OPTIONS.name;
  const loader = new BrickButtonLoader();

  return {
    [name](context: SummernoteContext) {
      context.memo(`button.${name}`, () => {
        const options = mergedOptions(context, configured);
        Object.entries(options.brickAliases).forEach(([alias, buttonName]) => loader.register(alias, buttonName));
        const components = options.subBricks.map((brick) => loader.load(context, brick));
        const ui = jquery.summernote!.ui;
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
    },
  };
}

export function registerSummernoteBricks(
  jquery: JQueryLike,
  configured: Partial<BricksOptions> = {},
): void {
  if (!jquery.summernote) throw new Error('Summernote must be loaded before Summernote Bricks.');
  Object.assign(jquery.summernote.plugins, createSummernoteBricksPlugin(jquery, configured));
}
