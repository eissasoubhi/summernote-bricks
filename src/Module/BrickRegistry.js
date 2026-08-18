class BrickRegistry {
    constructor(factories) {
        this.factories = Object.create(null);
        const initialFactories = factories || {};

        Object.keys(initialFactories).forEach((name) => {
            this.register(name, initialFactories[name]);
        });
    }

    register(name, factory) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new TypeError('A brick name must be a non-empty string.');
        }

        if (typeof factory !== 'function') {
            throw new TypeError(`Brick "${name}" must be registered with a factory function.`);
        }

        this.factories[name] = factory;
        return this;
    }

    has(name) {
        return Object.prototype.hasOwnProperty.call(this.factories, name);
    }

    resolve(name) {
        if (!this.has(name)) {
            const available = this.names();
            const suffix = available.length ? ` Available bricks: ${available.join(', ')}.` : '';
            throw new Error(`Unknown Summernote brick "${name}".${suffix}`);
        }

        return this.factories[name];
    }

    create(name) {
        const brick = this.resolve(name)();

        if (!brick) {
            throw new Error(`Brick factory "${name}" did not return a plugin instance.`);
        }

        return brick;
    }

    names() {
        return Object.keys(this.factories);
    }
}

module.exports = BrickRegistry;
