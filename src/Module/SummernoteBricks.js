import SubBrickLoader from "./SubBrickLoader";

// Orchestrates standalone Summernote brick plugins under a single dropdown.
export default class SummernoteBricks
{
    constructor(options) {
        this.options = $.extend({
            name: 'summernoteBricks',
            buttonLabel: '<i class="fa fa-puzzle-piece"></i> SN bricks',
            tooltip: 'Summernote bricks',
            SNOptions: {}
        }, options);
        this.plugins = []
        this.subBricks = []
        this.subBrickLoader = new SubBrickLoader()

        // Add the sub-bricks to the Summernote plugin registry.
        this.loadSubBricks()
    }

    createDropdown() {
        let components = [];

        for (let i = 0; i < this.subBricks.length; i++) {
            components.push(this.subBricks[i].createButton())
        }

        let dropdown = $.summernote.ui.buttonGroup([
            $.summernote.ui.button({
                className: 'dropdown-toggle',
                contents: this.options.buttonLabel,
                tooltip: this.options.tooltip,
                data: {
                    toggle: 'dropdown'
                }
            }),
            $.summernote.ui.dropdown({
                contents: components,
                className: 'dropdown-style'
            })
        ])

        return dropdown.render()
    }

    loadSubBricks() {
        let options = this.options.SNOptions[this.options.name] || {};
        let subBricks = options.subBricks || []
        let brickFactories = options.brickFactories || {}

        Object.keys(brickFactories).forEach((name) => {
            this.subBrickLoader.register(name, brickFactories[name])
        })

        $.each(subBricks, (index, subBrick) => {
            this.subBricks.push(this.subBrickLoader.loadSubBrick(subBrick))
        })

        for (let i = 0; i < this.subBricks.length; i++) {
            let plugin = this.subBricks[i].getPlugin()
            $.extend($.summernote.plugins, plugin);
        }
    }
}
