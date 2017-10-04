global.page_instance = null;
global.Page = class Page
{
    constructor()
    {

        if(global.page_instance)
        {
            return global.page_instance;
        }
        this.plugins_list = {};
        global.page_instance = this;
        // log(this)
    }

    hasScript(script_tag_id, id_selector_type = true)
    {
        var selector = script_tag_id;

        if(id_selector_type)
        {
            selector = "#" + selector;
        }

        return $('head '+ selector).length
    }

    addScript(content)
    {
        $(content).appendTo('head')
    }

    makeSureScriptIsAdded(script_tag_id, content, id_selector_type = true)
    {
        if(! this.hasScript(script_tag_id, id_selector_type))
        {
            this.addScript(content);
        }
    }

    removeJavascriptListnerFromScript(script, filter_selector)
    {
        var javascript_listner_start = 'document.addEventListener("DOMContentLoaded", function(event){';
        var javascript_listner_end = '})';

        if(filter_selector)
        {
            script = _helpers.parseToJQueryObject(script, true).find(filter_selector).addBack(filter_selector).prop('outerHTML');
        }

        if(script.indexOf(javascript_listner_start) != -1 )
        {
            script = script.replace(javascript_listner_start, "");
            var js_listner_end_index = script.lastIndexOf(javascript_listner_end); // last index of string to remove

            if (js_listner_end_index != -1)
            {
                var chars_before_js_listner_end = script.substr(0, js_listner_end_index);
                var chars_after_js_listner_end = script.substr(js_listner_end_index + javascript_listner_end.length);
                var script_without_js_listner = chars_before_js_listner_end + chars_after_js_listner_end;
            }

            return script_without_js_listner;
        }
    }

    addPlugin(plugin)
    {
        if(! this.plugins_list[plugin.name] )
        {
            this.plugins_list[plugin.name] = plugin;
        }

        return this;
    }

    getPlugin(plugin_name)
    {
        if(this.plugins_list[plugin_name])
        {
           return this.plugins_list[plugin_name];
        }

        return false;
    }

    getAllCurrentlyEditingContents()
    {
        var current_editable_contents = []

        $.each(this.plugins_list, function (index, plugin) {
            var content;

            for(var i = 0; i < plugin.inserted_editable_contents.length; i++)
            {
                content = plugin.inserted_editable_contents[i];
                if(content.content_current_state == "editing")
                {
                    current_editable_contents.push(content)
                }
            }
        })

        return current_editable_contents;
    }

    static get()
    {
        return new Page()
    }
}
global._page = Page.get();