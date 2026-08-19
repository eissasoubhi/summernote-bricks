const BrickRegistry = require('./BrickRegistry');

class SubBrickLoader {
    constructor(registry) {
        this.registry = registry || new BrickRegistry({
            'summernote-gallery': 'summernoteGallery',
            'summernote-heading': 'summernoteHeading',
        });
    }

    register(name, buttonName) {
        this.registry.register(name, buttonName);
        return this;
    }

    resolveButtonName(name) {
        return this.registry.resolve(name);
    }

    loadButton(context, name) {
        const buttonName = this.resolveButtonName(name);
        const buttonMemo = context.memo(`button.${buttonName}`);

        if (!buttonMemo) {
            throw new Error(
                `Summernote brick "${name}" requires the "${buttonName}" button to be registered before editor initialization.`
            );
        }

        return typeof buttonMemo === 'function' ? buttonMemo() : buttonMemo;
    }

    names() {
        return this.registry.names();
    }
}

module.exports = SubBrickLoader;
