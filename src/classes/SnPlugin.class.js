global.SnPlugin = class SnPlugin
{
    constructor(name, type, classname, data, behavior)
    {
        this.name = name;
        this.type = type;
        this.classname = classname;
        this.data = data;
        this.tooltip = _helpers.lang(this.name+'.tooltip');
        this.btn_contents = _helpers.lang(this.name+'.label');
        this.initCommonAttributes();
        this.setBehavior(behavior);
        this.page = new Page();
        this.page.addPlugin(this)
        this.initAttributes();
        this.defineOuterEvents();
        this.setEvents();
    }

    setBehavior(behavior_type)
    {
        this.behavior = Behavior.get(behavior_type, this);
    }

    initCommonAttributes()
    {
        this.summernote_ui = $.summernote.ui;
        this.style_tag_id = 'style#bloc_' + this.name + '_style';
        this.script_tag_id = 'script#bloc_' + this.name + '_script';
        this.blocs_contents_folder = _helpers.getConfig().bricks_assets;
        this.common_blocs_contents_folder = this.blocs_contents_folder + '/common';
        this.plugin_contents_folder = this.blocs_contents_folder + '/' + this.name;
        //contents files
        this.modal_template_html_file = this.common_blocs_contents_folder + '/modal_template.html'
        this.style_file = this.plugin_contents_folder + '/style.html'
        this.html_file = this.plugin_contents_folder + '/html.html'
        this.script_file = this.plugin_contents_folder + '/script.html'

        this.events = {};
        this.editable_content_events = {};
        this.excluded_contents_files = ['script'];
        this.remote_contents_files = []; // content from url
        this.inserted_editable_contents = [];
        this.current_editable_content;
    }

    initAttributes()
    {
        this.initCommonAttributes();
    }

    excludeContentsFiles(files_names)
    {
        var filename;

        for (var i = 0; i < files_names.length; i++)
        {
            filename = files_names[i];

            if (this.excluded_contents_files.indexOf(filename) === -1)
            {
                this.excluded_contents_files.push(filename)
            }
        }
    }

    removeFromExcludedContentsFiles(files_names)
    {
        var filename, index;

        for (var i = 0; i < files_names.length; i++)
        {
            filename = files_names[i];
            index = this.excluded_contents_files.indexOf(filename);
            if (index !== -1)
            {
                this.excluded_contents_files.splice(index, 1);
            }
        }
    }

    isContentsFileExcluded(file_name)
    {
        return $.inArray(file_name, this.excluded_contents_files) != -1
    }

    defineOuterEvents()
    {
        var me = this;
        me.onBtnClick  = function ()
        {

        }

        me.initialize = function ()
        {
            me.loadContentToAttribute(me.style_file, 'style');
            me.loadContentToAttribute(me.html_file, 'html');
            me.loadContentToAttribute(me.script_file, 'script');
        }

        return {
                    onBtnClick : me.onBtnClick,
                    initialize : me.initialize
                };
    }

    createButton()
    {
        var me = this;
        return me.summernote_ui.button(
        {
            className: me.classname,
            contents: me.btn_contents,
            tooltip: me.tooltip,
            data: me.data,
            click: me.onBtnClick
        });
    }

    addEvent(event)
    {
        this.events[event[0]] = event[1];
    }

    addEditableContentEvent(event_name, event_callback)
    {
        this.editable_content_events[event_name] = event_callback;
    }

    fireEditableContentEvent(event_name)
    {

        var event;
        if(event = this.editable_content_events[event_name])
        {
            return event();
        }
        return false;
    }

    setEvents()
    {
        var me = this;
        this.addEvent(['summernote.init', function () {
            me.setEdiotr($(this));
            me.editor.setOptionsProperties(me)
            me.removeFromExcludedContentsFiles(me.remote_contents_files);
        }]);

        this.addEvent(['summernote.keyup', function (we, e) {
            me.editor.saveLastFocusedElement()
        }]);
    }

    setEdiotr($editor)
    {
        this.editor = new Editor($editor, this.context);
    }

    render()
    {
        var me = this;
        var plugin = {};

        plugin[me.name] = function (context) {
            // use renderControl() method that is difined in derived class
            context.memo('button.' + me.name, me.renderControl())
            // console.dir(me.editor)
            me.context = context;
            this.events = me.events;
            this.initialize = me.initialize;
        }
        return plugin;
    }

    loadContentToAttribute (url, store_attribute)
    {
        var me = this;
        // get content from url
        // logif('gallery', this.name, store_attribute, url);
        if (this.excluded_contents_files.indexOf(store_attribute) !== -1)
        {
            return false;
        }

        return    $.get(url, function(content)
                    {
                        me[store_attribute] = content;
                    }).fail(function()
                    {
                        console.error("error : cannot load content from "+url);
                    });
    }

    pageHeadHasStyle()
    {
        return $('head '+ this.style_tag_id).length
    }

    addStyleToCurrentPage()
    {
        if (! this.pageHeadHasStyle())
        {   // add modal style if not already existes
            $(this.style).appendTo('head');
        };
    }

}