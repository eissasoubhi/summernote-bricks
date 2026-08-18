import SummernoteGallery from "summernote-gallery/dist/module"
import SummernoteHeading from "summernote-heading/dist/module"
import BrickRegistry from "./BrickRegistry"

export default class SubBrickLoader {
    constructor(registry) {
        this.registry = registry || new BrickRegistry({
            'summernote-gallery': SummernoteGallery,
            'summernote-heading': SummernoteHeading,
        });
    }

    register(name, Brick) {
        this.registry.register(name, Brick);
        return this;
    }

    loadSubBrick(name) {
        return this.registry.resolve(name);
    }

    names() {
        return this.registry.names();
    }
}
