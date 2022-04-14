import SummernoteBricksPlugin from './Module'


const _summernoteDecorator = $.fn.summernote

$.fn.summernote = function (options) {

    var plugin = new SummernoteBricksPlugin({
        SNOptions: options
    });

    // add the plugin to summernote
    $.extend($.summernote.plugins, plugin.getPlugin());

    return _summernoteDecorator.apply($(this), arguments)
}
