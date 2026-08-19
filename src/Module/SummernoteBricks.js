import SubBrickLoader from "./SubBrickLoader";

// Composes already-registered Summernote plugin buttons under one dropdown.
export default class SummernoteBricks
{
    constructor(options) {
        this.options = $.extend({
            name: 'summernoteBricks',
            buttonLabel: '<i class="fa fa-puzzle-piece"></i> SN bricks',
            tooltip: 'Summernote bricks',
            brickAliases: {}
        }, options);
        this.subBrickLoader = new SubBrickLoader()
    }

    getOptions(context) {
        return $.extend({}, this.options, context.options[this.options.name] || {});
    }

    registerAliases(aliases) {
        Object.keys(aliases || {}).forEach((name) => {
            this.subBrickLoader.register(name, aliases[name])
        })
    }

    createDropdown(context) {
        const options = this.getOptions(context);
        const subBricks = options.subBricks || [];
        const components = [];

        this.registerAliases(options.brickAliases);

        for (let i = 0; i < subBricks.length; i++) {
            components.push(this.subBrickLoader.loadButton(context, subBricks[i]))
        }

        // Summernote 0.9.x dropdown renderers consume `items`, not the historical
        // `contents` option. Render an empty native Summernote dropdown first,
        // then append the already-rendered plugin buttons so their click handlers
        // are preserved across BS3/BS4/BS5/Lite UI implementations.
        const dropdown = $.summernote.ui.dropdown({
            items: []
        });

        const group = $.summernote.ui.buttonGroup([
            $.summernote.ui.button({
                className: 'dropdown-toggle',
                contents: options.buttonLabel,
                tooltip: options.tooltip,
                data: {
                    toggle: 'dropdown'
                }
            }),
            dropdown
        ]).render();

        $(group).find('.note-dropdown-menu').append(components);

        return group
    }
}
