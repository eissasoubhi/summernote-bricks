$ = window.jQuery;
    require("./utility/autoload.js"); // must be replaced with an all-folder-files/automatic autoload

    var plugins = [
                    new H2(),
                    new Panel(),
                    new Menu(),
                    new Gallery(),
                    new Thumbnails(),
                    new ContactForm()
                   ];
    var plg;

    var list_children_items = [];

    $.each(plugins, function(index, plugin) {
        list_children_items.push(plugin.renderControl());
    });

    plugins.push(new BricksList(list_children_items));

    $.each(plugins, function(index, plugin) {
        plg = plugin.render();
        $.extend($.summernote.plugins, plg);
    });
