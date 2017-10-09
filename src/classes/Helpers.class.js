global.helpers_instance = null;

global.Helpers = class Helpers
{
    constructor()
    {
        if(global.helpers_instance)
        {
            return global.helpers_instance;
        }

        this.called_functions = [];

        global.helpers_instance = this;
    }

    callOnce(fn, fn_name_space, context)
    {
        if(! this.functionAlreadyCalled(fn_name_space))
        {
            var function_to_call = fn;

            if(context)
            {
                function_to_call = $.proxy(fn, context);
            }

            function_to_call(this);
        }
    }

    functionAlreadyCalled(function_name)
    {
        var called = false;
        // log(this.called_functions)
        if(this.called_functions.indexOf(function_name) !== -1)
        {
            called = true;
        }
        this.called_functions.push(function_name);

        return  called;
    }

    static get()
    {
        return new Helpers()
    }

    parseToJQueryObject(html, keepScripts)
    {
        if(typeof html == 'string')
        {
            html = $($.parseHTML(html, keepScripts));
        }
        return html;
    }

    getTagType(tag)
    {
        var tag_name = $(tag).prop('tagName');

        if(tag_name == 'INPUT')
        {
            tag_name = tag_name + '-' + $(tag).prop('type');
        }

        return tag_name.toLowerCase();
    }

    getConfig(extra_config)
    {
        var initialization_config = {};
        var default_config = require('../config/default.js');
        if(page_instance.editor)
            initialization_config = page_instance.editor.context.options.bricks

        return $.extend(true, default_config, initialization_config, extra_config || {});
    }

    lang(key)
    {
        var config = _helpers.getConfig(),
        lang = config.lang || "en",
        langs = require("../config/langs.js"),
        trans = null;
        key = lang+'.'+key;
        // a key with dot notation, eg : en.h2.title
        trans = key.split('.').reduce(function (item,i) {
            return item ? item[i] : {};
        }, langs);

        return trans && !$.isEmptyObject(trans) ? trans : key;
    }
}
global._helpers = Helpers.get();
