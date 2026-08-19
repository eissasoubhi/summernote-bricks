class BrickRegistry {
    constructor(aliases) {
        this.aliases = Object.create(null);
        const initialAliases = aliases || {};

        Object.keys(initialAliases).forEach((name) => {
            this.register(name, initialAliases[name]);
        });
    }

    register(name, buttonName) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new TypeError('A brick alias must be a non-empty string.');
        }

        if (typeof buttonName !== 'string' || !buttonName.trim()) {
            throw new TypeError(`Brick "${name}" must reference a non-empty Summernote button name.`);
        }

        this.aliases[name] = buttonName;
        return this;
    }

    has(name) {
        return Object.prototype.hasOwnProperty.call(this.aliases, name);
    }

    resolve(name) {
        return this.has(name) ? this.aliases[name] : name;
    }

    names() {
        return Object.keys(this.aliases);
    }
}

module.exports = BrickRegistry;
