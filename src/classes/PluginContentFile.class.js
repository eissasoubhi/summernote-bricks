global.PluginContentFile = class PluginContentFile
{
    constructor(plugin)
    {
        this.plugin = plugin;
        this.setPluginDefaultFiles()
    }

    setPluginDefaultFiles()
    {
        var plugin = this.plugin;
        plugin.blocs_contents_folder = _helpers.getConfig().bricks_assets;
        plugin.common_blocs_contents_folder = plugin.blocs_contents_folder + '/common';
        plugin.plugin_contents_folder = plugin.blocs_contents_folder + '/' + plugin.name;
        //contents files
        plugin.modal_template_html_file = plugin.common_blocs_contents_folder + '/modal_template.html'
        plugin.style_file = plugin.plugin_contents_folder + '/style.html'
        plugin.html_file = plugin.plugin_contents_folder + '/html.html'
        plugin.script_file = plugin.plugin_contents_folder + '/script.html'
    }

    loadContentToAttribute (url, store_attribute)
    {

        var plugin = this.plugin;
        // get content from url

        if (plugin.excluded_contents_files.indexOf(store_attribute) !== -1)
        {
            return false;
        }

        return    $.get(url, function(content)
                    {
                        plugin[store_attribute] = content;
                    }).fail(function()
                    {
                        console.error("error : cannot load content from "+url);
                    });
    }


    removeFromExcludedContentsFiles(files_names)
    {
        var filename, index, plugin = this.plugin;

        for (var i = 0; i < files_names.length; i++)
        {
            filename = files_names[i];
            index = plugin.excluded_contents_files.indexOf(filename);
            if (index !== -1)
            {
                plugin.excluded_contents_files.splice(index, 1);
            }
        }
    }

    excludeContentsFiles(files_names)
    {
        var filename, plugin = this.plugin;

        for (var i = 0; i < files_names.length; i++)
        {
            filename = files_names[i];

            if (plugin.excluded_contents_files.indexOf(filename) === -1)
            {
                plugin.excluded_contents_files.push(filename)
            }
        }
    }

    isContentsFileExcluded(file_name)
    {
        return $.inArray(file_name, this.plugin.excluded_contents_files) != -1
    }
}
