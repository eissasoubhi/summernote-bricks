import SubBrickLoader from "./SubBrickLoader";
import SummernoteGallery from "summernote-gallery/src/Module"
// implements SummernotePluginInterface
export default class SummernoteBricks
{
    constructor(options) {
        this.options = $.extend({
            name: 'summernoteBricks',
            buttonLabel: '<i class="fa fa-puzzle-piece"></i> SN bricks',
            tooltip: 'summernote bricks Dropdown',
            SNOptions: {}
        }, options);
        this.plugins = []
        this.subBricks = []


        // Add the sub-bricks to the summernote plugins
        this.loadSubBricks()
    }

    createDropdown() {

        let components = [];

        for (let i = 0; i < this.subBricks.length; i++) {
            components.push(this.subBricks[i].createButton())
        }

        let dropdown = $.summernote.ui.buttonGroup([
            /* create a button */
            $.summernote.ui.button({
                className: 'dropdown-toggle',
                contents: this.options.buttonLabel,
                tooltip: this.options.tooltip,
                click: function () {
                    console.log('summernote bricks button clicked')
                },
                data: {
                    toggle: 'dropdown'
                }
            }),
            /* create a dropdown */
            $.summernote.ui.dropdown({
                contents: components,
                className: 'dropdown-style',
                callback: function($dropdown) {

                }
            })
        ])

        return dropdown.render()
    }

    loadSubBricks() {

        let options = this.options.SNOptions[this.options.name] || {};
        let subBricks = options.subBricks || []

        $.each(subBricks, (index, subBrick) => {

            let SubBrick = SubBrickLoader.loadSubBrick(subBrick)

            this.subBricks.push(new SubBrick())
        })

        for (let i = 0; i < this.subBricks.length; i++) {
            let subBrick = this.subBricks[i]
            let plugin = subBrick.getPlugin()
            // console.log('plugin', plugin)
            $.extend($.summernote.plugins, plugin);
        }
    }
}
