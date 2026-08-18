import SummernoteGallery from "summernote-gallery/dist/module"
import SummernoteHeading from "summernote-heading/dist/module"
import BrickRegistry from "./BrickRegistry"

export default class SubBrickLoader {
    constructor(registry) {
        this.registry = registry || new BrickRegistry({
            'summernote-gallery': () => new SummernoteGallery('summernoteGallery'),
            'summernote-heading': () => new SummernoteHeading('summernoteHeading'),
        });
    }

    register(name, factory) {
        this.registry.register(name, factory);
        return this;
    }

    loadSubBrick(name) {
        const brick = this.registry.create(name);

        if (typeof brick.getPlugin !== 'function' || typeof brick.createButton !== 'function') {
            throw new TypeError(`Brick "${name}" must expose getPlugin() and createButton().`);
        }

        return brick;
    }

    names() {
        return this.registry.names();
    }
}
