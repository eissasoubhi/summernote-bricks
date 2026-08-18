import SummernoteBricks from "./SummernoteBricks";

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
                'summernote.keyup': function() {},
                'summernote.init': function() {}
            };

            this.initialize = function() {};
        }

        return plugin;
    }
}
