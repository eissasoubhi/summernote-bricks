
import SummernoteBricks from "./SummernoteBricks";
import SummernoteGallery from "summernote-gallery/src/Module"


export default class SummernoteBricksPlugin {
    constructor(options) {
        this.summernoteBricks = new SummernoteBricks(options)
    }

    getPlugin() {
        var plugin = {};
        var _this = this;
        let options = this.summernoteBricks.options
        let summernoteBricks = this.summernoteBricks

        plugin[options.name] = function(context) {

            let buttonLabel = context.options[options.name]?.buttonLabel || _this.summernoteBricks.options.buttonLabel

            _this.summernoteBricks.options.buttonLabel = buttonLabel

            context.memo('button.' + options.name, summernoteBricks.createDropdown());

            this.events = {
                'summernote.keyup': function(we, e) {

                },
                'summernote.init': function(we, e) {

                }
            };

            this.initialize = function() {

            };
        }

        return plugin;
    }
}