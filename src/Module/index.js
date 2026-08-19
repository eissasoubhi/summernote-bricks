import SummernoteBricks from "./SummernoteBricks";

export default class SummernoteBricksPlugin {
    constructor(options) {
        this.summernoteBricks = new SummernoteBricks(options)
    }

    getPlugin() {
        const plugin = {};
        const summernoteBricks = this.summernoteBricks;
        const name = summernoteBricks.options.name;

        plugin[name] = function(context) {
            context.memo('button.' + name, function() {
                return summernoteBricks.createDropdown(context);
            });
        }

        return plugin;
    }
}
