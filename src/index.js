import SummernoteBricksPlugin from './Module'

const plugin = new SummernoteBricksPlugin();

// Register Bricks through Summernote's normal plugin extension point.
$.extend($.summernote.plugins, plugin.getPlugin());
