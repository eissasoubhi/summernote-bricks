export * from './summernote';

export interface BricksPluginContext {
  readonly summernote: unknown;
  readonly jquery: unknown;
  readonly options: Readonly<Record<string, unknown>>;
}

export interface BricksPlugin {
  readonly name: string;
  install(context: BricksPluginContext): void;
  destroy?(context: BricksPluginContext): void;
}

export function definePlugin<T extends BricksPlugin>(plugin: T): T {
  return plugin;
}

export class PluginRegistry {
  readonly #plugins = new Map<string, BricksPlugin>();

  register(plugin: BricksPlugin): void {
    const name = plugin.name.trim();

    if (!name) {
      throw new Error('A Bricks plugin must have a non-empty name.');
    }

    if (this.#plugins.has(name)) {
      throw new Error(`Bricks plugin "${name}" is already registered.`);
    }

    this.#plugins.set(name, plugin);
  }

  get(name: string): BricksPlugin | undefined {
    return this.#plugins.get(name);
  }

  has(name: string): boolean {
    return this.#plugins.has(name);
  }

  list(): readonly BricksPlugin[] {
    return [...this.#plugins.values()];
  }
}
