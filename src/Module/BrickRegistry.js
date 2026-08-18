class BrickRegistry {
    constructor(bricks) {
        this.bricks = Object.create(null);
        const initialBricks = bricks || {};

        Object.keys(initialBricks).forEach((name) => {
            this.register(name, initialBricks[name]);
        });
    }

    register(name, Brick) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new TypeError('A brick name must be a non-empty string.');
        }

        if (typeof Brick !== 'function') {
            throw new TypeError(`Brick "${name}" must be a constructor.`);
        }

        this.bricks[name] = Brick;
        return this;
    }

    has(name) {
        return Object.prototype.hasOwnProperty.call(this.bricks, name);
    }

    resolve(name) {
        if (!this.has(name)) {
            const available = this.names();
            const suffix = available.length ? ` Available bricks: ${available.join(', ')}.` : '';
            throw new Error(`Unknown Summernote brick "${name}".${suffix}`);
        }

        return this.bricks[name];
    }

    names() {
        return Object.keys(this.bricks);
    }
}

module.exports = BrickRegistry;
