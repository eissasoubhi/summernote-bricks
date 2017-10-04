global.Behavior = class Behavior
{
    constructor(behavior_type, plugin)
    {
        this.behavior_type = behavior_type;
        this.plugin = plugin;
    }

    static get(behavior_type, plugin)
    {
        switch(behavior_type)
        {
            case 'simple':
                return new SimpleBehavior(behavior_type, plugin)
                break;
            case 'modal':
                return new ModalBehavior(behavior_type, plugin)
                break;
            case 'no_behavior':
                return 'no behavior';
                break;
            default:
                console.error('invalid behavior type : '+ behavior_type)
        }
    }

    insertPluginContentToEditor(content)
    {
        var plugin = this.plugin, editable_content;
        this.insertStyleToEditor();
        this.insertScriptToEditor();
        content = content || plugin.html;
        editable_content = this.getEditableContentFeatures(content)
        // warn(editable_content)
        if(editable_content.isContentEditable())
        {
            plugin.editor.addContent(editable_content.content);

            if(editable_content.isContentInlineEditable())
            {
                editable_content.clickEditButton();
            }
            else if(editable_content.isContentModalEditable())
            {
                editable_content.disableContent();
            }
        }
        else
        {
            plugin.editor.addContent(content);
        }
    }

    insertStyleToEditor(style, style_tag_id, style_filename)
    {
        var plugin = this.plugin;
        style_filename = style_filename || 'style';
        style_tag_id = style_tag_id || plugin.style_tag_id;
        style = style || plugin.style;
        if(! plugin.isContentsFileExcluded(style_filename) && ! plugin.editor.hasStyle(style_tag_id) )
        {
            plugin.editor.addContent(style);
        }
    }

    insertScriptToEditor(script, script_tag_id, script_filename)
    {
        var plugin = this.plugin;
        script_filename = script_filename || 'script';
        script_tag_id = script_tag_id || plugin.script_tag_id;
        script = script || plugin.script;
        if(! plugin.isContentsFileExcluded(script_filename) && ! plugin.editor.hasScript(script_tag_id) )
        {
            plugin.editor.addContent(script);
        }
    }

    getEditableContentFeatures(content)
    {
        return EditableBloc.get(this.behavior_type, this.plugin, content);
    }

}
