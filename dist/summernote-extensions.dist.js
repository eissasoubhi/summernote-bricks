(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){
global.BricksList = class BricksList extends SnDropdownPlugin
{
    constructor(dropdown_content)
    {
        super('bricks', 'sn_dropdown', 'dropdown-toggle',{toggle: 'dropdown'}, dropdown_content, 'no_behavior');
    }


}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
global.ContactForm = class ContactForm extends SnBtnPlugin
{
    constructor()
    {
        super('contact_form', 'sn_button', 'btn-block', {}, 'simple');
    }

    defineOuterEvents()
    {
        var me = this;
        var parent_events = super.defineOuterEvents();
        me.onBtnClick  = function ()
        {
            parent_events.onBtnClick();
            me.behavior.onBtnClick(me);
        }
    }
    // initAttributes()
    // {
    //     super.initAttributes();
    //     this.removeFromExcludedContentsFiles(['script']);
    // }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
global.EditableBloc = class EditableBloc
{
    constructor(editable_bloc_type, plugin, content)
    {
        content = _helpers.parseToJQueryObject(content);

        if($(content).length == 0)
        {
            return false;
        }
        // log(content)
        this.editable_bloc_type = editable_bloc_type;
        this.plugin = plugin;
        plugin.inserted_editable_contents.push(this);
        this.content_states = ['editing', 'validated']
        this.content_current_state = 'validated';
        this.actions_btns_position = plugin.editor.actions_btns_position;
        this.editable_field = '.editable-bloc_feature.editable-field'
        this.linebreak = '<p><br></p>'
        this.initActionsButtons();
        this.initContent(content);

    }

    static get(editable_bloc_type, plugin, content)
    {
        switch(editable_bloc_type)
        {
            case 'simple':
                return new SimpleEditableBloc(editable_bloc_type, plugin, content)
                break;
            case 'modal':
                return new ModalEditableBloc(editable_bloc_type, plugin, content)
                break;
            case 'no_behavior':
                return 'no editable bloc';
                break;
            default:
                console.error('invalid behavior type : '+ editable_bloc_type)
        }
    }

    initActionsButtons()
    {
        this.remove_btn = '<button type="button" class="remove btn btn-danger"><i class="fa fa-times"></i></button>';
        this.edit_btn = '<button type="button" class="edit btn btn-success"><i class="fa fa-pencil"></i></button>';
        this.ok_btn = '<button type="button" class="ok btn btn-success"><i class="fa fa-check"></i></button>';
        this.top_linebreak_btn = '<button type="button" class="top linebreak btn btn-default"><i class="fa fa-rotate-270 fa-level-up"></i></button>';
        this.bottom_linebreak_btn = '<button type="button" class="bottom linebreak btn btn-default"><i class="fa fa-rotate-90 fa-level-down"></i></button>';
        this.actions_btns_holder = '<div class="bloc-action-btns"></div>';
    }

    initContent(content)
    {
        this.wrapContent(content);
        this.setIdentifier();
        this.setEditableBlocProperties();
        this.updateActionsButtons();
        this.setEvents();

        return this.content
    }

    /*removeEditableFeatures()
    {
        this.unWrapContent();
        this.removeIdentifier();
        this.removeEditableBlocProperties();

        return this.content
    }*/

    wrapContent(content)
    {
        if(! content.is('.editable-bloc'))
        {
            content = $(content).wrapAll('<div class="editable-bloc"></div>').parent();
        }
        return this.content = content;
    }

    /*unWrapContent()
    {
        var content = this.content;
        return this.content = $(content).unwrap('.editable-bloc');
    }*/

    isContentEditable(content)
    {
        content = this.content || content;
        // log('isContentModalEditable', this.isContentModalEditable(content))
        return this.isContentInlineEditable(content) || this.isContentModalEditable(content);
    }

    isContentInlineEditable(content)
    {
        content = this.content || content;
        return $(content).find(this.editable_field).length;
    }

    isContentModalEditable(content)
    {
        content = this.content || content;
        // log(content)
        return $(content).find('.bloc_'+ this.plugin.name).data('modal-editable');
    }

    setIdentifier()
    {
        var plugin = this.plugin;
        var content_identifier = this.content.attr('id');

        if(! content_identifier || !(new RegExp('^'+ plugin.name +'_\\d+$')).test( content_identifier ))
        {
            var id = +new Date();
            this.content_identifier = plugin.name+'_'+id
            $(this.content).attr('id', this.content_identifier)
        }
        else
        {
             this.content_identifier = content_identifier;
        }

        return this.content;
    }

    /*removeIdentifier()
    {
        var plugin = this.plugin;
        var content_identifier = this.content.attr('id');

        if(content_identifier && (new RegExp('^'+ plugin.name +'_\\d+$')).test( content_identifier ))
        {
            $(this.content).removeAttr('id')
        }

        return this.content;
    }*/

    setEditableBlocProperties()
    {
        var plugin = this.plugin;
        $(this.content).attr({
            'data-editablebloc-plugin': plugin.name
        });

        return this.content;
    }

    // removeEditableBlocProperties()
    // {
    //     var plugin = this.plugin;
    //     var props = $(this.content).data();
    //     $.each(props, function(prop_key, prop_val) {
    //         if(/^editablebloc-.*/.test(prop_key))
    //         {
    //             $(this.content).removeAttr('data-'+prop_key)
    //         }
    //     });

    //     return this.content;
    // }

    setActionsButtons(actions_btns, content)
    {
        content = this.getAttachedContentToDom(content);
        var actions_btns_holder = $(this.actions_btns_holder).clone().hide();

        for (var i = 0; i < actions_btns.length; i++) {
            actions_btns_holder.append(this[actions_btns[i]+'_btn'])
        }
        // log(actions_btns)
        this.getActionsButtons(content).remove();
        this.setActionsButtonsPosition(actions_btns_holder);
        content.prepend(actions_btns_holder);

        return content;
    }

    getActionsButtons(content)
    {

        content = this.getAttachedContentToDom(content);
        var btns_class_name = '.'+$(this.actions_btns_holder).attr('class');

        return content.find(btns_class_name);
    }

    enableContent(content)
    {
        content = this.getAttachedContentToDom(content);
        content.find(this.editable_field).attr('contenteditable', 'true')

        return $(content);
    }

    focusOnText(content)
    {
        content = this.getAttachedContentToDom(content);
        setTimeout($.proxy(function () {
            content.find(this.editable_field).first().focus();
        }, this), 2)

        return $(content);
    }

    disableContent(content)
    {
        content = this.getAttachedContentToDom(content);
        content = $(content).attr('contenteditable', 'false');
        content.find(this.editable_field).attr('contenteditable', 'false');

        return $(content);
    }

    contentInDom()
    {
        this.content.parents('html').length
    }

    setContentState(state, content)
    {
        content = this.getAttachedContentToDom(content);
        content.removeClass(this.content_states.join(' ')).addClass(state);
        this.content_current_state = state;

        return $(content)
    }

    getAttachedContentToDom(content)
    {
        if(content && !this.contentInDom())
        {
            return content;
        }

        return $(this.content);
    }

    setEvents()
    {
        var editable_div = this.plugin.editor.editable_div;

        $(editable_div)
        .on('click', '#'+ this.content_identifier +' .bloc-action-btns button.remove', {editable_bloc : this}, this.onContentRemove)
        .on('click', '#'+ this.content_identifier +' .bloc-action-btns button.ok', {editable_bloc : this}, this.onContentValidate)
        .on('click', '#'+ this.content_identifier +' .bloc-action-btns button.edit', {editable_bloc : this}, this.onContentEdit)
        .on('click', '#'+ this.content_identifier +' .bloc-action-btns button.top.linebreak', {editable_bloc : this , position : 'top'}, this.onAddLinebreak)
        .on('click', '#'+ this.content_identifier +' .bloc-action-btns button.bottom.linebreak', {editable_bloc : this , position : 'bottom'}, this.onAddLinebreak)
        ;
        this.plugin.editor.onPositionDropdownChanged($.proxy(function (position) {
            this.setActionsButtonsPosition(this.getActionsButtons(), position);
        }, this))

    }

    clickEditButton()
    {
        var edit_btn;
        if((edit_btn = $(this.content).find('.bloc-action-btns button.edit')).length)
        {
            edit_btn.click();
        }
        else
        {
            error("'.bloc-action-btns button.edit' doesn't existe")
        }
    }

    clickValidateButton()
    {
        var validate_btn;
        if((validate_btn = $(this.content).find('.bloc-action-btns button.ok')).length)
        {
            validate_btn.click();
        }
    }

    // events
    onContentRemove(event)
    {
        $(this).parents('.editable-bloc').remove();
        var plugin = event.data.editable_bloc.plugin
        plugin.editor.enable();
    }

    onContentEdit(event)
    {
        var editable_bloc = event.data.editable_bloc;

        if(! editable_bloc.plugin.page.getAllCurrentlyEditingContents().length && editable_bloc.isContentInlineEditable())
        {
            $.proxy(editable_bloc.editContent, this, event.data.editable_bloc)();
        }
    }

    onContentValidate(event)
    {
        var editable_bloc = event.data.editable_bloc
        $.proxy(editable_bloc.validateContent, this, event.data.editable_bloc)();
    }

    onAddLinebreak(event)
    {
        var editable_bloc = event.data.editable_bloc;
        var position = event.data.position;
        $.proxy(editable_bloc.addLinebreak, this, editable_bloc, position)();
    }

    editContent(editable_bloc)
    {
        var btn = $(this)
        var content = btn.parents('.editable-bloc');
        editable_bloc.plugin.editor.disable();
        content = editable_bloc.enableContent(content);
        content = editable_bloc.setContentState("editing", content);
        content = editable_bloc.focusOnText(content);
        editable_bloc.updateActionsButtons(content);
    }

    validateContent(editable_bloc)
    {
        var btn = $(this)
        var content = btn.parents('.editable-bloc');
        editable_bloc.plugin.editor.enable();
        content = editable_bloc.disableContent(content);
        content = editable_bloc.setContentState("validated", content);
        editable_bloc.updateActionsButtons(content);
    }

    addLinebreak(editable_bloc, position)
    {
        var btn = $(this)
        var content = btn.parents('.editable-bloc');
        if(position == 'top')
        {
            $(editable_bloc.linebreak).insertBefore(content);
        }
        else if(position == 'bottom')
            $(editable_bloc.linebreak).insertAfter(content);
        {
        }
    }

    updateActionsButtons(content)
    {
        if(this.content_current_state == "editing")
        {
            this.setActionsButtons(this.getButtons().editing_btns, content)
        }
        else if(this.content_current_state == "validated")
        {
            this.setActionsButtons(this.getButtons().validation_btns, content);
        }
    }

    setActionsButtonsPosition(actions_btns, position)
    {
        this.plugin.editor.actions_btns_position = this.actions_btns_position = position || this.actions_btns_position;
        actions_btns = $(actions_btns);
        var initil_style = {
                right: 'initial',
                left: 'initial',
                margin: 'initial',
                textAlign: 'initial',
                width: 'initial',
            }

        if(this.actions_btns_position == 'left')
        {
            actions_btns.css( $.extend({}, initil_style , {left : 0}));
        }
        else if(this.actions_btns_position == 'right')
        {
            actions_btns.css( $.extend({}, initil_style , {right : 0}));
        }
        else if(this.actions_btns_position == 'center')
        {
            actions_btns.css( $.extend({}, initil_style , {
                right: 0,
                left: 0,
                margin: 'auto',
                textAlign: 'center',
                width: '200px',
            }));
        }

        return actions_btns;
    }

    getButtons()
    {
        var editing_btns = ['remove'];
        var unchangeable_btns = ['top_linebreak', 'bottom_linebreak']
        if(this.isContentInlineEditable())
        {
            editing_btns.push('ok')
        }
        if(this.isContentModalEditable())
        {
            editing_btns.push('modal_edit')
        }
        editing_btns = editing_btns.concat(unchangeable_btns);

        var validation_btns = ['remove'];
        if(this.isContentInlineEditable())
        {
            validation_btns.push('edit')
        }
        if(this.isContentModalEditable())
        {
            validation_btns.push('modal_edit')
        }
        validation_btns = validation_btns.concat(unchangeable_btns);

        return {
            editing_btns : editing_btns,
            validation_btns : validation_btns
        };
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
// summernote editor (wysiwyg : jquery plugin)
global.Editor = class Editor
{
    constructor($sn_editor, context)
    {
        this.sn_editor = $sn_editor;
        this.context = context;
        this.editable_div = context.layoutInfo.editable;
        this.white_space = '&nbsp;&nbsp;';
        this.on_position_dropdown_changed = [];
        this.actions_btns_position = _helpers.getConfig().actions_btns_position
        this.position_buttons = '<div class="edit-btns-position">'+
                                    '<label >'+ _helpers.lang('options_buttons') +' : </label> '+
                                    '<select class="" role="group" aria-label="Extra-small button group">'+
                                        '<option value="left" class="btn btn-default">'+ _helpers.lang('left') +'</option>'+
                                        '<option value="center" class="btn btn-default">'+ _helpers.lang('middle') +'</option>'+
                                        '<option value="right" class="btn btn-default">'+ _helpers.lang('right') +'</option>'+
                                    '</select>'+
                                '</div>';

        this.editor_white_spaces = new EditorWhiteSpaces(this);
        this.createPositionDropdown();
        this.defineOuterEvents();
        this.initEvents();
        this.initEditableContent();
        this.appendCommonScriptToBody();
        this.page = new Page();
        this.page.editor = this;
    }

    defineOuterEvents()
    {
        var me = this;
        me.saveLastFocusedElement = function(test)
        {
            var focused_element = window.getSelection().focusNode;
            var parent = $(me.editable_div).get(0);
            if ($.contains(parent, focused_element))
            {
                $(me.sn_editor).data('last_focused_element', focused_element)
            };
        }
    }

    initEditableContent()
    {
        var self = this;
        _helpers.callOnce(function (helper) {
            var self  = this;
            var editable_blocs = this.editable_div.find('.editable-bloc');

            editable_blocs.each(function(index, el) {
                self.setEditableFeatures($(this));
            });

        }, 'Editor.initEditableContent', this)
    }

    setEditableFeatures(editable_bloc)
    {
        var plugin_name = this.getEditableBlocProperties(editable_bloc).plugin;
        var plugin = _page.getPlugin(plugin_name);

        if(plugin)
        {
            plugin.editor = this;
            var editable_content = EditableBloc.get(plugin.behavior.behavior_type, plugin, editable_bloc);
            /*if(! editable_content.isContentEditable())
            {
                log('removing')
                editable_content.removeEditableFeatures();
            }*/
        }
    }

    appendCommonScriptToBody()
    {
        $.get(_helpers.getConfig().bricks_assets+'/common/script.html', function(script) {
            if($(script).attr('id') && ! $('body').find('script#'+$(script).attr('id')).length)
                $('body').append(script);
        })
    }

    getEditableBlocProperties(editable_bloc)
    {
        editable_bloc = _helpers.parseToJQueryObject( editable_bloc );
        return {
            plugin : editable_bloc.attr('data-editablebloc-plugin'),
        };
    }

    recoverEditorFocus()
    {
        var last_focused_el = $(this.sn_editor).data('last_focused_element');
        if(typeof last_focused_el !== "undefined")
        {
            var editable_div = this.editable_div;
            var range = document.createRange();
            var sel = window.getSelection();

            range.setStart(last_focused_el, last_focused_el.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            editable_div.focus();
        }
    }

    getContent()
    {
        return this.sn_editor.summernote('code');
    }

    hasStyle(style_tag_id)
    {
        var content = this.getContent();
        return $(content).find(style_tag_id).length;
    }

    hasScript(script_tag_id)
    {
        var content = this.getContent();
        return $(content).find(script_tag_id).length;
    }

    addContent(content)
    {
        // debugger
        // log(content)
        this.context.invoke('editor.pasteHTML', content);
        this.context.invoke('editor.pasteHTML', this.white_space);
    }

    enable()
    {
        this.editable_div.attr('contenteditable', 'true');
    }

    disable()
    {
        this.editable_div.attr('contenteditable', 'false');
    }

    initEvents()
    {
        this.setKeypressEvent();
        this.setMousemoveEvent();
        this.setContentChangedEvent();
        this.setPositonButtonEvent();
        this.setPageSaveEvent();
    }

    setKeypressEvent()
    {
        $(this.editable_div).on('keypress', this.saveLastFocusedElement)
    }

    setMousemoveEvent()
    {
        $(this.editable_div).on('mousemove', this.saveLastFocusedElement)
    }

    setContentChangedEvent()
    {
        if(! _helpers.functionAlreadyCalled('Editor.setContentChangedEvent'))
        {
            $(this.editable_div).on('DOMCharacterDataModified DOMSubtreeModified DOMNodeInserted',{'editor' : this} , function (event) {
                event.data.editor.editor_white_spaces.setRemovableLineBreaks()
                $('#content').val($(this).html());
            });
        }
    }

    setPositonButtonEvent()
    {
        var position_buttons_classname = $(this.position_buttons).attr('class');
        $('.'+position_buttons_classname + ' select').on('change', {'editor' : this}, function (event) {
            var callbacks = event.data.editor.onPositionDropdownChanged();

            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i]($(this).val())
            }
        })
    }

    setPageSaveEvent()
    {
        _helpers.callOnce(function () {
            var self = this;
            $(this.editable_div).parents('form').on('submit', function(event) {
                // validate curently editing bloc
                $(self.editable_div).find('.bloc-action-btns button.ok').click();
            });
        }, 'Editor.setPageSaveEvent', this)
    }

    onPositionDropdownChanged(callback)
    {
        if(callback)
        {
            this.on_position_dropdown_changed.push(callback);
        }
        else
        {
            return  this.on_position_dropdown_changed;
        }
    }

    createPositionDropdown()
    {
        if(! _helpers.functionAlreadyCalled('Editor.createPositionDropdown'))
        {
            var position_buttons = _helpers.parseToJQueryObject(this.position_buttons)
            $(position_buttons).css({
                'text-align' : 'right'
            })

            $(position_buttons).insertBefore($(this.context.layoutInfo.editor)).parent().css({
                position : 'relative',
            })
        }
    }

    setOptionsProperties(plugin)
    {
        var options = this.sn_editor.data();
        var property;
        var options = _helpers.getConfig();
        $.extend(true, plugin, options[plugin.name]);
    }


}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
global.EditorWhiteSpaces = class EditorWhiteSpaces
{
    constructor(editor)
    {
        this.editor = editor;
        this.line_break_class = "removable-line-break";
        this.highlight_line_break = "highlight-line-break";
        this.initActionButtons();
        this.createButtons();
        this.setEvents();
    }

    initActionButtons()
    {
        this.remove_btn = '<button type="button" class="remove btn btn-danger"><i class="fa fa-times"></i></button>';
        this.actions_btns_holder = '<div class="whitespace-action-btns"></div>';
    }

    setRemovableLineBreaks()
    {
        $(this.editor.editable_div).find('p').each($.proxy(function (index, p) {
            if(this.isLineBreak(p))
            {
                var editor_has_many_break_lines = this.editorHasManyBreakLines();
                if(! this.isRemovableLineBreak(p) && editor_has_many_break_lines)
                {
                    this.setRemovableLineBreakFeatures(p)
                }
                else if(! editor_has_many_break_lines)
                {
                    this.removeRemovableLineBreakFeatures(p)
                }
            }
            else if(this.isWhiteSpaceWithStyleTag(p))
            {
                this.clearWhiteSpaces(p)
            }
            else
            {
                this.removeRemovableLineBreakFeatures(p)
            }
        }, this))
    }

    getActionsButtons()
    {
        if(this.$actions_buttons.parents('html').length)
        {   // still attached to dom
            return this.$actions_buttons;
        }
        this.$actions_buttons = this.getActionButtonsFromDom();
        if(this.$actions_buttons.length)
        {
            return this.$actions_buttons;
        }

        return this.createButtons();
    }

    isRemovableLineBreak(element)
    {
        return $(element).hasClass(this.line_break_class);
    }

    isLineBreak(element)
    {
        return / *<br> */.test($(element).html());
    }

    isTexLine(element)
    {
        return $(element).text();
    }

    editorHasManyBreakLines()
    {
        var length = 0, has_many = false;

        $(this.editor.editable_div).find('p').each($.proxy(function (index, p) {
            if(this.isLineBreak(p))
            {
                length++
                if(length > 1)
                {
                    has_many = true;
                    return;
                }
            }
        }, this))

        return has_many;
    }

    editorTextLines()
    {
        var length = 0, has_text = false;

        $(this.editor.editable_div).find('p').each($.proxy(function (index, p) {
            if(this.isTexLine(p))
            {
                has_text = true;
                return;
            }
        }, this))

        return has_text;
    }

    clearWhiteSpaces(element)
    {
        var without_whitespaces = $(element).html().replace(/<br>|&nbsp;/gi, '');
        $(element).html(without_whitespaces)
    }

    isWhiteSpaceWithStyleTag(element)
    {
        return this.hasStyleTag($(element).html()) && this.hasWhiteSpace($(element).html());
    }

    hasStyleTag(string)
    {
        return /<style\b[^<]*?(?:(?!<\/style>)<[^<]*)*(?:(?!<\/style>)<[^<]*)*<\/style>/.test(string);
    }

    hasWhiteSpace(string)
    {
        return /&nbsp;/.test(string) || /<br>/.test(string);
    }

    setRemovableLineBreakFeatures(line_break)
    {
        line_break = $(line_break);
        line_break.addClass(this.line_break_class);
    }

    removeRemovableLineBreakFeatures(line_break)
    {
        line_break = $(line_break);
        line_break.removeClass(this.line_break_class);
    }

    setActionButtons(content, actions_btns)
    {
        var actions_btns_holder = $(this.actions_btns_holder).clone().hide();
        for (var i = 0; i < actions_btns.length; i++) {
            actions_btns_holder.append(this[actions_btns[i]+'_btn'])
        }

        content.find('.'+$(actions_btns_holder).attr('class')).remove();
        content.append(actions_btns_holder);

        return content;
    }

    createButtons()
    {
        this.setActionButtons(this.editor.editable_div, ['remove']);
        this.$actions_buttons = this.getActionButtonsFromDom();

        return this.$actions_buttons;
    }

    getActionButtonsFromDom()
    {
        return $(this.editor.editable_div).find('.'+$(this.actions_btns_holder).attr('class'));
    }

    setEvents()
    {
        $(this.editor.editable_div).on('mouseenter', '.'+this.line_break_class, {'editor_white_spaces' : this}, function (event) {
            var editor_white_spaces = event.data.editor_white_spaces;
            editor_white_spaces.highlightLineBreak($(this))
            editor_white_spaces.attacheLineBreakToActionsButtons($(this))
            editor_white_spaces.showActionButtons($(this).position())
        })

        $(this.editor.editable_div).on('mouseleave', '.'+this.line_break_class, {'editor_white_spaces' : this}, function (event) {
            var editor_white_spaces = event.data.editor_white_spaces;
            editor_white_spaces.hideActionButtons(event, this)
        })

        var actions_buttons_class = '.' + this.getActionsButtons().attr('class') + ' button';

        $(this.editor.editable_div).on('click', actions_buttons_class,  {'editor_white_spaces' : this}, function (event) {
            var editor_white_spaces = event.data.editor_white_spaces;
            editor_white_spaces.removeAttachedLinebreak($(this))
            // buttons_holder.data('line_break').remove();
        })

       $(this.editor.editable_div).on('mouseenter', actions_buttons_class,  {'editor_white_spaces' : this}, function (event) {
            var editor_white_spaces = event.data.editor_white_spaces;
            editor_white_spaces.highlightLineBreak($(this).parent().data('line_break'))
        })

       $(this.editor.editable_div).on('mouseleave', actions_buttons_class,  {'editor_white_spaces' : this}, function (event) {
            var editor_white_spaces = event.data.editor_white_spaces;
            editor_white_spaces.lowlightLineBreak($(this))
        })
    }

    showActionButtons(position)
    {
        this.getActionsButtons().css('top', position.top+'px').finish().fadeIn(500);
    }

    hideActionButtons(event, line_break)
    {
        var next_element = event.toElement || event.relatedTarget
        if(! $(next_element).is( this.getActionsButtons().find('button') ))
        {
            this.getActionsButtons().finish().fadeOut(500);
            this.lowlightLineBreak($(line_break))
        }
    }

    attacheLineBreakToActionsButtons(line_break)
    {
        this.getActionsButtons().data('line_break', $(line_break));
    }

    removeAttachedLinebreak(action_button)
    {
            var buttons_holder = $(action_button).parent();
            buttons_holder.data('line_break').remove();
            buttons_holder.fadeOut();
            this.setRemovableLineBreaks();
    }

    highlightLineBreak(line_break)
    {
        $(line_break).addClass(this.highlight_line_break)
    }

    lowlightLineBreak(line_break)
    {
        $(line_break).removeClass(this.highlight_line_break)
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){
global.Gallery = class Gallery extends SnBtnPlugin
{
    constructor()
    {
        super('gallery', 'sn_button', 'btn-block', {}, 'modal');
    }

    defineOuterEvents()
    {
        var me = this;
        var parent_events = super.defineOuterEvents();

        me.onBtnClick  = function ()
        {
            parent_events.onBtnClick()
            me.behavior.onBtnClick();
        }

        me.initialize = function ()
        {
            parent_events.initialize();
            me.behavior.initialize();
        }
    }

    initAttributes()
    {
        super.initAttributes();
        this.remote_contents_files = ['modal_body'];
        this.behavior.initAttributes();
        this.excludeContentsFiles(['style']);
    }

    initProperties(modal)
    {
        modal.modal_title = _helpers.lang('gallery.modal_title');
        modal.refresh_on_open = true;
        modal.selected_images_class = "selected-img";
    }

    setPropertiesToModal(modal)
    {
        var $modal = modal.modal;
        $modal.find('.modal-title').html(modal.modal_title);
    }

    setModalContentHtml(modal)
    {
        this.initProperties(modal);
        this.replaceImageSelectionClassNameToStyle()
    }

    setModalContentEvents()
    {
        this.selectImageEvent();
        this.selectAllImagesEvent();
    }

    getContentToInsert()
    {
        var content = $.parseHTML(this.html);
        return $(content).clone();
    }

    selectImageEvent()
    {
        var modal_obj = this.behavior.modal;
        var $modal = this.behavior.modal.modal;

        $modal.find('img').click(function(event)
        {
            $(this).toggleClass(modal_obj.selected_images_class);
        });
    }

    selectAllImagesEvent()
    {
        var modal_obj = this.behavior.modal;
        var $modal = this.behavior.modal.modal;
        var me = this;

        $modal.find('#select-all-img').click(function(event)
        {
            $modal.find('img').addClass(modal_obj.selected_images_class);
        });
    }

    getFinalContent()
    {
        var modal_obj = this.behavior.modal,
            $modal = modal_obj.modal, img_model, img_to_insert,
            images_group, $selected_img ;

        // log();
        images_group = this.getContentToInsert();
        img_model = images_group.find('img');
        images_group.html("");
        $selected_img = $modal.find('.img-item img.' + modal_obj.selected_images_class);

        $selected_img.each(function(index, el)
        {
            img_to_insert = img_model.clone();
            images_group.append(img_to_insert.attr({
                                    src: $(this).attr('src'),
                                    alt: $(this).attr('alt') || ""
                                }))
        });

        return images_group.prop('outerHTML');
    }

    saveModalEvent()
    {
        var modal = this.behavior.modal;

        modal.setEvent("add", $.proxy(function(plugin) {
            var plugin_content = plugin.getFinalContent();

            plugin.behavior.insertToEditor(plugin_content);
        }, null, this))

        modal.setEvent("edit", $.proxy(function(plugin) {
            var plugin_content = plugin.getFinalContent();

            plugin.behavior.replaceEditableContent(plugin_content);
        }, null, this))
    }

    replaceImageSelectionClassNameToStyle()
    {
        var modal = this.behavior.modal;
        var replaced_modal_style = this.modal_style.replace(/\{selected_images_class\}/ig, modal.selected_images_class);
        this.modal_style = replaced_modal_style;
    }

}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
(function (global){
global.H2 = class H2 extends SnBtnPlugin
{
    constructor()
    {
        super('h2', 'sn_button', 'btn-block', {}, 'simple');
    }

    defineOuterEvents()
    {
        var me = this;
        var parent_events = super.defineOuterEvents();
        me.onBtnClick  = function ()
        {
            parent_events.onBtnClick();
            me.behavior.onBtnClick(me);
        }
    }

}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
(function (global){
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../config/default.js":22,"../config/langs.js":23}],10:[function(require,module,exports){
(function (global){
global.Menu = class Menu extends SnBtnPlugin
{
    constructor()
    {
        super('menu', 'sn_button', 'btn-block', {}, 'modal');
    }

    defineOuterEvents()
    {
        var me = this;
        var parent_events = super.defineOuterEvents();

        me.onBtnClick  = function ()
        {
            parent_events.onBtnClick()
            me.behavior.onBtnClick();
        }

        me.initialize = function ()
        {
            parent_events.initialize();
            me.behavior.initialize();
        }
    }

    initAttributes()
    {
        super.initAttributes();
        this.behavior.initAttributes();
    }

    initProperties(modal)
    {
        modal.modal_title = _helpers.lang(this.name + '.modal_title');
        modal.modal_content_add_item = _helpers.lang(this.name + '.modal_content_add_item')
        modal.modal_content_default_menu_label = _helpers.lang(this.name + '.modal_content_default_menu_label')
        modal.modal_content_active_item = _helpers.lang(this.name + '.modal_content_active_item')
        modal.max_menu_items = 12;
        modal.min_menu_items = 1;
        modal.refresh_on_open = true;
    }

    setPropertiesToModal(modal)
    {
        var $modal = modal.modal;
        $modal.find('.modal-title').html(modal.modal_title);
        $modal.find('#add-item').html(modal.modal_content_add_item);
        // $modal.find('.item-menu-label').val(modal.modal_content_default_menu_label);
        $modal.find('.current').html(modal.modal_content_active_item);
    }

    setModalContentHtml(modal)
    {
        this.initProperties(modal);
    }

    setModalContentEvents()
    {
        this.addMenuItemEvent();
        this.removeMenuItemEvent();
    }

    getModalMenuItemTemplate()
    {
        var modal = this.behavior.modal;
        return modal.getChildrenElements('.menu-item').first().prop('outerHTML');
    }

    getMenuItemTemplateToInsert()
    {
        return $(this.html).find('ul.navbar-nav li').first().clone();
    }

    addMenuItemEvent()
    {
        var me = this;
        var modal_obj = this.behavior.modal;
        var $modal = this.behavior.modal.modal;

        $modal.find("button#add-item").click(function(event)
        {
            if ($modal.find(".menu-item").length < modal_obj.max_menu_items)
            {
                $modal.find(".menu-list-items").append(me.getModalMenuItemTemplate())
                // set remove event to the new item
                me.removeMenuItemEvent();
            }
        });
    }

    removeMenuItemEvent()
    {
        var modal_obj = this.behavior.modal;
        var $modal = this.behavior.modal.modal;

        $modal.find("button.remove-item").click(function(event)
        {
            if ($modal.find(".menu-item").length > modal_obj.min_menu_items)
            {
                var $item = $(this).parents('.menu-item');
                $item.remove()
            }
        });
    }

    getContentToInsert()
    {
        var content = $.parseHTML(this.html);
        return $(content).clone();
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

    setValuesToMenuItemTemplate(user_menu_item, $black_menu_item_tpl)
    {
        var child_item ;
        //get inserted menu items values to insert to the model
        child_item = $(user_menu_item).find('input.item-menu-url');
        var url_item_type = this.getTagType(child_item);
        var url = child_item.val();

        child_item = $(user_menu_item).find('input.item-menu-label');
        var label_item_type = this.getTagType(child_item);
        var label = child_item.val();

        child_item = $(user_menu_item).find('.current-item');
        var is_current_item_type = this.getTagType(child_item);
        var is_current = child_item.prop("checked");
        // var li_class = child_item.prop("checked");


        //insert menu items values to the model
        $black_menu_item_tpl.find('a span').text(label).attr({
            'data-editable-tag': 'item-menu-label',
            'data-value': label,
            'data-type' : label_item_type
        });

        $black_menu_item_tpl.find('a').attr('title', label);

        $black_menu_item_tpl.find('a').attr('href', url).attr({
            'data-editable-tag': 'item-menu-url',
            'data-value': url,
            'data-type' : url_item_type
        });
        $black_menu_item_tpl.addClass(is_current ? "active" : "").attr({
            'data-editable-tag': 'current-item',
            'data-value': is_current,
            'data-type' : is_current_item_type
        });

        return $black_menu_item_tpl;
    }

    getFinalContent()
    {
        var $bloc_menu_content,
            $ul, me = this,
            $user_menu_items,
            $modal = this.behavior.modal.modal;

        $bloc_menu_content = this.getContentToInsert();
        $ul = $bloc_menu_content.find('ul.navbar-nav');
        $ul.html("");
        $user_menu_items = $modal.find('.menu-item'); /*get menu items inserted by the user*/

        $user_menu_items.each(function(index, el)
        {   // make a copy from the menu item model to insert to the editor
            var $black_menu_item_template = me.getMenuItemTemplateToInsert();
            var user_menu_item = this;
            var $populated_black_menu_item = me.setValuesToMenuItemTemplate(user_menu_item, $black_menu_item_template)
            // log(this)
            $ul.append($populated_black_menu_item);
        });

        $bloc_menu_content.find('ul').html($ul.html());

        return $bloc_menu_content.prop('outerHTML');
    }

    saveModalEvent()
    {
        var modal = this.behavior.modal;

        modal.setEvent("add", $.proxy(function(plugin) {
            var plugin_content = plugin.getFinalContent();

            plugin.behavior.insertToEditor(plugin_content);
        }, null, this))

        modal.setEvent("edit", $.proxy(function(plugin) {
            var plugin_content = plugin.getFinalContent();

            plugin.behavior.replaceEditableContent(plugin_content);
        }, null, this))
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
global.Modal = class Modal
{
    constructor(plugin)
    {
        this.plugin = plugin;
        this.initProperties();
        this.jQuery = $;
        this.mode = "add"; // add or edit
    }

    initProperties()
    {
        // default/common properties
        this.modal_close_btn_text = _helpers.lang("close");
        this.modal_ok_btn_text = _helpers.lang("add");
        this.modal_update_btn_text = _helpers.lang("update");
        this.style_tag_id = this.plugin.name + "_style";
        this.style = this.plugin.modal_style;
        this.refresh_on_open = false;
        this.has_been_opened = false;
        this.events = {};
    }

    setEvent(event_name, event_callback)
    {
        this.events[event_name] = event_callback;
    }

    applyEvents()
    {
        var self = this;
        $.each(this.events, function (event_name, event_callback) {
            // self.modal.find("button#"+ event_name).click(event_callback);
            self.modal.on('click', 'button#'+ event_name, event_callback);
        })
        // var event = this.events[this.mode];
        // log(this.events['add'])
        // this.modal.on('click', 'button#'+ this.mode, event);
        // this.modal.find("button#"+ this.mode).click(event);
    }

    setTemplate()
    {
        this.setTemplateHtml();
        this.setTemplateEvents();
    }

    setTemplateHtml()
    {
        $ = this.jQuery;
        this.modal = $(this.plugin.modal_template_html).hide();
        this.updateModalButtons();
    }

    updateModalButtons()
    {
        this.modal.find('.modal-footer .modal-action:not(#close)').hide();
        this.modal.find('.modal-footer .modal-action#'+this.mode).show();
    }

    setTemplateEvents()
    {
        this.plugin.saveModalEvent();
        this.applyEvents();
    }

    setPropertiesToModal()
    {
        var plugin = this.plugin;
        var modal_body = plugin.modal_body;

        this.modal.attr('id', this.plugin.name + "_html");

        if(this.mode == "edit")
        {
            modal_body = this.setModalBodyValues(modal_body)
        }
        // log(plugin.name, plugin)
        // logif('gallery', plugin.name, modal_body);
        this.modal.find('.modal-body').html(modal_body);
        this.modal.find('#close').html(this.modal_close_btn_text);
        this.modal.find('#add').html(this.modal_ok_btn_text);
        this.modal.find('#edit').html(this.modal_update_btn_text);

        this.plugin.setPropertiesToModal(this);
    }

    setModalBodyValues(modal_body_html)
    {
        var modal_body = _helpers.parseToJQueryObject(modal_body_html);
        var content = this.plugin.current_editable_content.getAttachedContentToDom();

        modal_body.find(".editable-bloc_feature.editable-section").addBack(".editable-bloc_feature.editable-section").each(function(index, el) {
            var default_editable_section = $(this);
            // warn($(this).data('edit-type'))
            if($(this).data('edit-type') == 'override')
            {
                var editable_section_parent = default_editable_section.parent();
                var editable_section_copy = default_editable_section.clone();
                default_editable_section.remove();

                content.find('.editable-bloc_feature.rended-section').each(function(index, el) {
                    var custom_editable_section = editable_section_copy.clone();

                    $(this).find('[data-editable-tag]').addBack('[data-editable-tag]').each(function(index, el) {
                        var type = $(this).data('type'),
                            value, class_name;

                        class_name = $(this).data('editable-tag');
                        value = $(this).data('value');

                        if(type == 'input-text')
                        {
                            custom_editable_section.find('.' + class_name).val(value);
                        }
                        else if(type == 'input-radio' || type == 'input-checkbox')
                        {
                            custom_editable_section.find('.' + class_name).prop('checked', $.parseJSON(value) );
                        }
                    });

                    editable_section_parent.append(custom_editable_section);
                });

            }
            else if($(this).data('edit-type') == 'edit')
            {
                content.find('.editable-bloc_feature.rended-section').each(function(index, el) {
                    var target_tags;
                    if($(this).data('target-tags') == 'self')
                    {
                        target_tags = $(this).is('[data-editable-tag]') ? $(this) : $([]);
                    }
                    else
                    {
                        target_tags = $(this).find('[data-editable-tag]').addBack('[data-editable-tag]');
                    }

                    target_tags.each(function(index, el) {
                        var type = $(this).data('type'),
                            value, selector;

                        selector = $(this).data('editable-tag');
                        value = $(this).data('value');
                        // info($(this))

                        if(type == 'img')
                        {
                            var src = $(this).attr('src');
                            default_editable_section.find('img[src="'+ src +'"]').addClass(selector)
                        }
                        else if(type == 'input-text')
                        {
                            default_editable_section.find(selector).val(value);
                        }
                        else if(type == 'input-radio' || type == 'input-checkbox')
                        {
                            default_editable_section.find(selector).prop('checked', $.parseJSON(value) );
                        }
                        else if(type == 'multiple')
                        {
                            var editable_tags = value;

                            $.each(editable_tags, function(key, editable_tag) {

                                if(editable_tag.type == 'select')
                                {
                                    default_editable_section.find('select'+ editable_tag.target).val(editable_tag.value);
                                }
                                else if(editable_tag.type == 'input-radio')
                                {
                                    default_editable_section.find('input[type="radio"][name="'+ editable_tag.target +'"][value="'+ editable_tag.value +'"]').prop("checked", true);
                                }
                                else if(editable_tag.type == 'input-checkbox')
                                {
                                    default_editable_section.find('input[type="checkbox"]'+ editable_tag.target).prop("checked", editable_tag.value);
                                }
                            });
                        }
                    });
                });
            }
        });;



        return modal_body;
    }

    setContent()
    {
        this.setContentHtml();
        this.setContentEvents();
    }

    setContentHtml()
    {
        this.initProperties();
        this.plugin.setModalContentHtml(this);
        this.setPropertiesToModal();
        this.addStyleToCurrentPage();
    }

    setContentEvents()
    {
        this.plugin.setModalContentEvents(this);
    }

    getChildrenElements(selector)
    {
        return this.modal.find(selector);
    }

    open(mode = "add")
    {
        if(this.refresh_on_open)
        {
            var me = this;
            this.mode = mode;
            this.plugin.behavior.refreshContent().then(function () {
                me.launchModal();
            });
        }
        else
        {
            me.launchModal();
        }

        // this.modal.modal();
        // this.has_been_opened = true;
    }

    launchModal()
    {
        this.modal.modal();
        this.has_been_opened = true;
    }

    openToEdit(editable_bloc)
    {
        // log(editable_bloc)
        // this.mode = "edit";
        this.plugin.current_editable_content = editable_bloc;
        this.open("edit");
    }

    close()
    {
        this.plugin.editor.recoverEditorFocus();
        this.modal.modal('hide');
    }

    pageHeadHasStyle()
    {
        return $('head #'+ this.style_tag_id).length
    }

    pageHeadHasScript()
    {
        return $('head #'+ this.script_tag_id).length
    }

    addStyleToCurrentPage()
    {
        if (! this.pageHeadHasStyle())
        {   // add modal style if not already existes
            $(this.style).appendTo('head');
        };
    }

    addScriptToCurrentPage()
    {
        if (! this.pageHeadHasScript())
        {
            $(this.script).appendTo('head');
        };
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
global.ModalBehavior = class ModalBehavior extends Behavior
{
    constructor(behavior_type, plugin)
    {
        super(behavior_type, plugin);
        this.setModal();
    }

    setModal()
    {
       this.modal = new Modal(this.plugin);
    }

    initModal()
    {
       this.modal.setTemplate();
       this.modal.setContent();
    }

    onBtnClick(plugin)
    {
        this.modal.open()
    }

    initialize()
    {
        var plugin = this.plugin;
        var me = this;

        var modal_template_promise = plugin.loadContentToAttribute(plugin.modal_template_html_file, 'modal_template_html' );
        var modal_body_promise = plugin.loadContentToAttribute(plugin.modal_body_file, 'modal_body');
        var modal_style_promise = plugin.loadContentToAttribute(plugin.modal_style_file, 'modal_style');
        // log(plugin.name, plugin)
        Promise.all([modal_template_promise, modal_body_promise, modal_style_promise]).then(function(data) {
          me.initModal();
        });
    }

    initAttributes()
    {
        var plugin = this.plugin;
        plugin.modal_body_file = plugin.plugin_contents_folder + '/modal_body.html'
        plugin.modal_style_file = plugin.plugin_contents_folder + '/modal_style.html'
        plugin.excludeContentsFiles(plugin.remote_contents_files);
    }

    insertToEditor(content)
    {
        this.modal.close();
        this.insertPluginContentToEditor(content);
    }

    refreshContent()
    {
        var plugin = this.plugin;
        var me = this, promise;

        promise =  plugin.loadContentToAttribute(plugin.modal_body_file, 'modal_body');

        promise.then(function (data) {
            me.modal.setContent();
            me.modal.updateModalButtons();
        });

        return promise;
    }

    replaceEditableContent(new_content)
    {
        this.modal.close();
        var editable_content = this.plugin.current_editable_content
        log(editable_content)
        var old_content = editable_content.getAttachedContentToDom().find('.bloc_' + this.plugin.name);

        old_content.replaceWith(new_content);
        editable_content.clickValidateButton();
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
(function (global){
global.ModalEditableBloc = class ModalEditableBloc extends EditableBloc
{
    constructor(editable_bloc_type, plugin, content)
    {
        super(editable_bloc_type, plugin, content);
    }

    initActionsButtons()
    {
        super.initActionsButtons()
        this.modal_edit_btn = '<button type="button" class="modal-edit btn btn-primary"><i class="fa fa-edit"></i></button>';
    }

    setEvents()
    {
        super.setEvents()
        $(this.plugin.editor.editable_div).on('click', '#'+ this.content_identifier +' .bloc-action-btns button.modal-edit', {editable_bloc : this}, this.onContentModalEdit)
    }

    onContentModalEdit(event)
    {
        var editable_bloc = event.data.editable_bloc
        $.proxy(editable_bloc.editContentInModal, this, event.data.editable_bloc)();
    }

    editContentInModal(editable_bloc)
    {
        editable_bloc.clickValidateButton();
        editable_bloc.plugin.behavior.modal.openToEdit(editable_bloc);
        editable_bloc.plugin.addEditableContentEvent('edited', $.proxy(function () {
            var editable_bloc = this;
            editable_bloc.updateActionsButtons();
        }, editable_bloc))
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(require,module,exports){
(function (global){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(require,module,exports){
(function (global){
global.Panel = class Panel extends SnBtnPlugin
{
    constructor()
    {
        super('panel', 'sn_button', 'btn-block', {}, 'simple');
    }

    defineOuterEvents()
    {
        var me = this;
        super.defineOuterEvents();
        me.onBtnClick  = function ()
        {
            me.behavior.onBtnClick(me);
        }
    }

}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
(function (global){
global.SimpleBehavior = class SimpleBehavior extends Behavior
{
    constructor(behavior_type, plugin)
    {
        super(behavior_type, plugin);
    }

    onBtnClick(plugin)
    {
        this.insertPluginContentToEditor()
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],17:[function(require,module,exports){
(function (global){
global.SimpleEditableBloc = class SimpleEditableBloc extends EditableBloc
{
    constructor(editable_bloc_type, plugin, content)
    {
        super(editable_bloc_type, plugin, content);
    }

}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
(function (global){
global.SnBtnPlugin = class SnBtnPlugin extends SnPlugin{
    renderControl()
    {
        var me = this;
        return me.renderButton();
    }

    renderButton()
    {
        var me = this;
        var button = me.createButton();
        return button.render();
    }

}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
(function (global){
global.SnDropdownPlugin = class SnDropdownPlugin extends SnPlugin {

    constructor(name, type, classname, data, dropdown_content, behavior)
    {
        super(name, type, classname, data, behavior);
        this.dropdown_content = dropdown_content;
    }

    renderControl()
    {
        var me = this;
        return me.renderDropdown();
    }

    renderDropdown()
    {
        var me = this;
        var dropdown = me.createDropdownComponents();
        return dropdown.render();
    }

    createDropdown()
    {
        var me = this;

        return me.summernote_ui.dropdown(
        {
            contents: me.dropdown_content,
            callback: function($dropdown) {

            }
        });
    }

    createDropdownComponents()
    {
        var me = this;
        return me.summernote_ui.buttonGroup([me.createButton(), me.createDropdown()])
    }

    defineOuterEvents()
    {
        // override default behavior
    }
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
(function (global){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],21:[function(require,module,exports){
(function (global){
global.Thumbnails = class Thumbnails extends SnBtnPlugin
{
    constructor()
    {
        super('thumbnails', 'sn_button', 'btn-block', {}, 'modal');
    }

    defineOuterEvents()
    {
        var me = this;
        var parent_events = super.defineOuterEvents();

        me.onBtnClick  = function ()
        {
            parent_events.onBtnClick()
            me.behavior.onBtnClick();
        }

        me.initialize = function ()
        {
            parent_events.initialize();
            me.behavior.initialize();
        }
    }

    initAttributes()
    {
        super.initAttributes();
        this.remote_contents_files = ['modal_body'];
        this.lightbox_script_tags_class = 'script.bloc_thumbnails_lightbox_plugin_script';
        this.lightbox_script_file = this.common_blocs_contents_folder + '/lightbox_script.html';
        this.loadContentToAttribute(this.lightbox_script_file, 'lightbox_script');
        this.behavior.initAttributes();
        this.removeFromExcludedContentsFiles(['script']);
    }

    initProperties(modal)
    {
        modal.modal_title = _helpers.lang('thumbnails.modal_title');
        modal.refresh_on_open = true;
        modal.selected_images_class = "selected-img";
        modal.image_redirect_action = "redirect";
        modal.image_zoom_action = "zoom";
        modal.image_none_action = "none";
        modal.image_with_title = true;
        modal.image_clique_action = modal.image_redirect_action;
        modal.cols_width = {
            lg12 : "col-lg-12 col-md-12 col-xs-12",
            lg6 : "col-lg-6 col-md-6 col-xs-12",
            lg4 : "col-lg-4 col-md-6 col-xs-12",
            lg3 : "col-lg-3 col-md-4 col-xs-6",
            lg2 : "col-lg-2 col-md-3 col-xs-6",
            lg1 : "col-lg-1 col-md-2 col-xs-6"
        };
    }

    setPropertiesToModal(modal)
    {
        var $modal = modal.modal;
        $modal.find('.modal-title').html(modal.modal_title);
        this.verifyAllImagesLinkInputState();
    }

    setModalContentHtml(modal)
    {
        this.initProperties(modal);
        this.replaceImageSelectionClassNameToStyle()
        this.applyLastUserChoices();
    }

    setModalContentEvents()
    {
        this.selectImageEvent();
        this.selectAllImagesEvent();
        this.selectImageActionEvent();
        this.checkImageWithTitleEvent();
    }

    checkImageWithTitleEvent()
    {
        var modal_obj = this.behavior.modal;
        var $modal = modal_obj.modal;

        $modal.find("#with_overly_title").change(function() {
            if($(this).is(':checked'))
            {
                modal_obj.image_with_title = true;
            }
            else
            {
                modal_obj.image_with_title = false;
            }
        });
    }

    selectImageActionEvent()
    {
        var modal_obj = this.behavior.modal;
        var $modal = this.behavior.modal.modal;
        var me = this;

        $modal.find('[name="link_type"]').change(function() {
            modal_obj.image_clique_action = $(this).val();
            me.verifyAllImagesLinkInputState();
        });
    }

    verifyAllImagesLinkInputState()
    {
        var $all_images = this.behavior.modal.modal.find('img');

        this.disableOrEnableImageLinkInput($all_images);
    }

    disableOrEnableImageLinkInput($images)
    {
        var i, $img,
        me = this,
        modal = this.behavior.modal;

        $images.each(function(index, el) {
            $img = $(this);

            if(me.isImageSelected($img) && modal.image_clique_action === modal.image_redirect_action)
            {   // enable image redirection url text input
                 $img.siblings('input.thumbnail-href').removeAttr('disabled');
            }
            else
            {   // disable image redirection url text input
               $img.siblings('input.thumbnail-href')
               .val('')
               .attr('disabled', 'disabled');
            }
        });
    }

    isImageSelected($img)
    {
        return $img.hasClass('selected-img');
    }

    getSelectedImages()
    {
        var modal = this.behavior.modal;
        var $modal = modal.modal;
        return $modal.find('.img-item img.' + modal.selected_images_class);
    }
    selectImageEvent()
    {
        var modal_obj = this.behavior.modal;
        var $modal = this.behavior.modal.modal;
        var me = this;

        $modal.find('img').click(function(event)
        {
            $(this).toggleClass(modal_obj.selected_images_class);
            me.verifyAllImagesLinkInputState();
        });
    }

    selectAllImagesEvent()
    {
        var modal_obj = this.behavior.modal;
        var $modal = this.behavior.modal.modal;
        var me = this;

        $modal.find('#select-all-img').click(function(event)
        {
            $modal.find('img').addClass(modal_obj.selected_images_class);
            me.verifyAllImagesLinkInputState();
        });
    }

    getContentToInsert()
    {
        var content = $.parseHTML(this.html);
        return $(content).clone();
    }

    // generates bootstrap classes to set a responsive width to thumbnail_item , example col-lg-3 col-md-2 col-xs-1
    setColsWidthToThumbnailItem($thumbnail_item, nb_img_per_line)
    {
        var modal = this.behavior.modal;

        var cols_width = 12 / nb_img_per_line;
        var lg_width = 'lg' + cols_width;
        var bootstrap_cols_class = modal.cols_width[lg_width];
        $thumbnail_item.addClass(bootstrap_cols_class);

        return $thumbnail_item;
    }

    getImageNumberPerLine()
    {
        return this.behavior.modal.modal.find('#nb-img-per-line').val();
    }

    getFinalContent()
    {
        var self = this,
        modal_obj = this.behavior.modal,
        $modal = modal_obj.modal;

        var $thumbnails_content = self.getContentToInsert();

        $thumbnails_content.find('.thumb').remove();
        // get selected img
        var $selected_images = self.getSelectedImages();
        var nb_img_per_line = self.getImageNumberPerLine();
        var $thumbnail_item, selected_image;
        this.applyLastUserChoices();

        $selected_images.each(function(index, el)
        {
            selected_image = this;
            $thumbnail_item = self.generateThumbnailItem(selected_image);
            $thumbnail_item = self.setColsWidthToThumbnailItem($thumbnail_item, nb_img_per_line);
            $thumbnails_content.append($thumbnail_item);
        });

        $thumbnails_content = self.saveLastUserChoices($thumbnails_content);

        return $thumbnails_content.prop('outerHTML');
    }

    applyLastUserChoices()
    {
        this.behavior.modal.modal.find('[name="link_type"]:checked').change();
        this.behavior.modal.modal.find("#with_overly_title").change();
    }

    saveLastUserChoices(thumbnails_content)
    {
        thumbnails_content = $(thumbnails_content);
        var value = [];

        value.push({
                        type : "select",
                        value : this.getImageNumberPerLine(),
                        target : "#nb-img-per-line",
                    })

        value.push({
                        type : "input-radio",
                        value : this.behavior.modal.image_clique_action,
                        target : "link_type",
                    });

        value.push({
                        type : "input-checkbox",
                        value : this.behavior.modal.image_with_title,
                        target : "#with_overly_title",
                    });
        thumbnails_content.attr({
            'data-editable-tag': 'multiple',
            'data-value' : JSON.stringify(value),
            'data-type' : 'multiple',
        });

        return thumbnails_content;
    }

    saveModalEvent()
    {
        var modal = this.behavior.modal;

        modal.setEvent("add", $.proxy(function(plugin) {
            var plugin_content = plugin.getFinalContent();
            var modal = plugin.behavior.modal;

            plugin.behavior.insertToEditor(plugin_content);

            var plugin_script = plugin.page.removeJavascriptListnerFromScript(plugin.script)

            plugin.page.makeSureScriptIsAdded(plugin.script_tag_id, plugin_script);

            if(modal.image_clique_action === modal.image_zoom_action )
            {
                plugin.behavior.insertScriptToEditor(plugin.lightbox_script, plugin.lightbox_script_tags_class, 'lightbox_script');
                plugin.page.makeSureScriptIsAdded(plugin.lightbox_script_tags_class, plugin.lightbox_script, /*id_selector_type = */false);
            }

        }, null, this))

        modal.setEvent("edit", $.proxy(function(plugin) {
            var plugin_content = plugin.getFinalContent();
            var modal = plugin.behavior.modal;

            if(modal.image_clique_action === modal.image_zoom_action )
            {
                plugin.behavior.insertScriptToEditor(plugin.lightbox_script, plugin.lightbox_script_tags_class, 'lightbox_script');
                plugin.page.makeSureScriptIsAdded(plugin.lightbox_script_tags_class, plugin.lightbox_script, false);
                plugin_content = plugin.setLightboxFeature(plugin_content);
            }
            else
            {
                plugin_content = plugin.removeLightboxFeature(plugin_content);
            }

            plugin.behavior.replaceEditableContent(plugin_content);

            $(window).resize();
            plugin.fireEditableContentEvent('edited');
        }, null, this))
    }

    setValuesToThumbnailItemTemplate(user_selected_image, $thumbnail_item_tpl)
    {
        //get inserted repeated items values to insert to the model
        var url = $(user_selected_image).attr('src');
        var alt = $(user_selected_image).attr('alt');
        var title = $(user_selected_image).attr('title');
        //insert repeated items values to the model
        var $thumbnail_item_image = $thumbnail_item_tpl.find('img');

        $thumbnail_item_image.attr({
            'src': url,
            'alt': alt,
            'title': title,
            'data-editable-tag': this.behavior.modal.selected_images_class,
            'data-value' : this.behavior.modal.selected_images_class,
            'data-type' : _helpers.getTagType($thumbnail_item_image),
        });

        return $thumbnail_item_tpl;
    }

    getThumbnailItemTemplateToInsert()
    {
        return $(this.html).find('.thumb').first().clone();
    }

    setRedirectionLinkToThumbnailItem($thumbnail_item, user_selected_image)
    {
        var $user_redirection_link_input = $(user_selected_image).siblings('input.thumbnail-href');
        var redirection_link = $user_redirection_link_input.val();
        $thumbnail_item.find('a.thumbnail').attr({
            'href': redirection_link,
            'data-editable-tag': '[data-ref="'+ $user_redirection_link_input.data('ref') +'"]',
            'data-value': redirection_link,
            'data-type' : 'input-text'
        });

        return $thumbnail_item;
    }

    setZoomPropertiesToThumbnailItem($thumbnail_item, user_selected_image)
    {
        //get inserted repeated items values to insert to the model
        var url = $(user_selected_image).attr('src');
        var title = $(user_selected_image).attr('title');

        $thumbnail_item.find('a.thumbnail').attr({
            "data-title" : title, // image title
            "href" : url // image url
        });

        $thumbnail_item = this.setLightboxFeature($thumbnail_item);

        return $thumbnail_item;
    }

    setLightboxFeature(thumb_item)
    {
        if(typeof thumb_item == "string")
        {
            thumb_item = _helpers.parseToJQueryObject(thumb_item);
            thumb_item.find('a.thumbnail').addBack('a.thumbnail').attr({
                "data-toggle" : 'lightbox',
                "data-gallery" : "multiimages"
            });

            return thumb_item.prop('outerHTML');
        }

        $(thumb_item).find('a.thumbnail').addBack('a.thumbnail').attr({
            "data-toggle" : 'lightbox',
            "data-gallery" : "multiimages"
        });

        return thumb_item;
    }

    removeLightboxFeature(thumb_item)
    {
        if(typeof thumb_item == "string")
        {
            thumb_item = _helpers.parseToJQueryObject(thumb_item);
            thumb_item.find('a.thumbnail').addBack('a.thumbnail').removeAttr('lightbox multiimages');
            return thumb_item.prop('outerHTML');
        }

        $(thumb_item).find('a.thumbnail').addBack('a.thumbnail').removeAttr('lightbox multiimages');
        return thumb_item;
    }

    removeLinkTagFromThumbnailItem($thumbnail_item)
    {
        var linkta_html = $thumbnail_item.find('a.thumbnail').html()
        var $span_tag = $('<span></span>')
                        .html(linkta_html)
                        .addClass('thumbnail');
        $thumbnail_item.find('a.thumbnail').replaceWith($span_tag);

        return $thumbnail_item;
    }

    removeThumbnailItemTitle($thumbnail_item)
    {
        $thumbnail_item.find('.overly').remove();
        return $thumbnail_item;
    }

    generateThumbnailItem(user_selected_image)
    {
        var $thumbnail_item;
        var modal = this.behavior.modal;
        // make a copy from the repeated item model to insert to the editor
        var $thumbnail_item_template = this.getThumbnailItemTemplateToInsert();

        var $populated_thumbnail_item = this.setValuesToThumbnailItemTemplate(user_selected_image, $thumbnail_item_template);

        if(modal.image_clique_action === modal.image_redirect_action)
        {   // set redirection link to the repeated_item
            $thumbnail_item = this.setRedirectionLinkToThumbnailItem($populated_thumbnail_item, user_selected_image);
        }
        else if(modal.image_clique_action === modal.image_zoom_action)
        {
            $thumbnail_item = this.setZoomPropertiesToThumbnailItem($populated_thumbnail_item, user_selected_image);
        }
        else if(modal.image_clique_action === modal.image_none_action)
        {   // replace link tag with a span
            $thumbnail_item = this.removeLinkTagFromThumbnailItem($populated_thumbnail_item)
        }

        if(! modal.image_with_title)
        {   // remove overly
            $thumbnail_item = this.removeThumbnailItemTitle($populated_thumbnail_item);
        }

        $thumbnail_item.addClass(modal.image_clique_action)

        return $thumbnail_item;
    }

    replaceImageSelectionClassNameToStyle()
    {
        var modal = this.behavior.modal;
        var replaced_modal_style = this.modal_style.replace(/\{selected_images_class\}/ig, modal.selected_images_class);
        this.modal_style = replaced_modal_style;
        modal.style = replaced_modal_style;
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
return module.exports = {
    lang: "en",
    bricks_assets: 'dist/bricks_assets',
    actions_btns_position: 'right',
}

},{}],23:[function(require,module,exports){
return module.exports = {
    en: {
        panel:{
            tooltip: "Add a new panel with text",
            label: "Panel",
        },
        menu:{
            tooltip: "Add a new menu",
            label: "Menu",
            modal_title: "Add menu links",
            modal_content_add_item: "Add link",
            modal_content_default_menu_label: "Home",
            modal_content_active_item: "Active",
        },
        h2:{
            tooltip: "Add a new h2 header",
            label: "H2",
        },
        gallery:{
            tooltip: "Add new images",
            label: "Images",
            modal_title: "Images",
        },
        contact_form:{
            tooltip: "Add a new contact form",
            label: "Contact form",
        },
        bricks:{
            tooltip: "Add predefined components",
            label: '<i class="fa fa-puzzle-piece"></i> Bricks <span class="caret"></span>',
        },
        thumbnails:{
            tooltip: "Add a generated gallery of uploaded images",
            label: "Thumbnails",
            modal_title: "Thumbnails",
        },
        close: "Close",
        add: "Add",
        update: "Update",
        options_buttons: "Options buttons",
        left: "Left",
        middle: "Middle",
        right: "Right",
    },
    fr: {
        panel:{
            label: "Panneau",
        },
        menu:{
            label: "Menu",
        },
        h2:{
            label: "Titre 2",
        },
        gallery:{
            label: "Images",
        },
        contact_form:{
            label: "Formulaire",
        },
        bricks:{
            label: '<i class="fa fa-puzzle-piece"></i> Briques <span class="caret"></span>',
        },
        thumbnails:{
            label: "Vignettes",
        },
    }
}
},{}],24:[function(require,module,exports){
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

},{"./utility/autoload.js":25}],25:[function(require,module,exports){
    require("./tools.js");
    require("../classes/SnPlugin.class.js");
    require("../classes/SnBtnPlugin.class.js");
    require("../classes/SnDropdownPlugin.class.js");
    require("../classes/Menu.class.js");
    require("../classes/Panel.class.js");
    require("../classes/BricksList.class.js");
    require("../classes/Editor.class.js");
    require("../classes/H2.class.js");
    require("../classes/Behavior.class.js");
    require("../classes/SimpleBehavior.class.js");
    require("../classes/ModalBehavior.class.js");
    require("../classes/Modal.class.js");
    require("../classes/Gallery.class.js");
    require("../classes/Thumbnails.class.js");
    require("../classes/Page.class.js");
    require("../classes/ContactForm.class.js");
    require("../classes/EditableBloc.class.js");
    require("../classes/EditorWhiteSpaces.class.js");
    require("../classes/Helpers.class.js");
    require("../classes/SimpleEditableBloc.class.js");
    require("../classes/ModalEditableBloc.class.js");
},{"../classes/Behavior.class.js":1,"../classes/BricksList.class.js":2,"../classes/ContactForm.class.js":3,"../classes/EditableBloc.class.js":4,"../classes/Editor.class.js":5,"../classes/EditorWhiteSpaces.class.js":6,"../classes/Gallery.class.js":7,"../classes/H2.class.js":8,"../classes/Helpers.class.js":9,"../classes/Menu.class.js":10,"../classes/Modal.class.js":11,"../classes/ModalBehavior.class.js":12,"../classes/ModalEditableBloc.class.js":13,"../classes/Page.class.js":14,"../classes/Panel.class.js":15,"../classes/SimpleBehavior.class.js":16,"../classes/SimpleEditableBloc.class.js":17,"../classes/SnBtnPlugin.class.js":18,"../classes/SnDropdownPlugin.class.js":19,"../classes/SnPlugin.class.js":20,"../classes/Thumbnails.class.js":21,"./tools.js":26}],26:[function(require,module,exports){
window.logcount = 0;
window.errorcount = 0;
window.infocount = 0;
window.warncount = 0;
window.log = function ()
{
    logcount++;
    switch(arguments.length)
    {
        case 0:
            console.trace(logcount);
            break;
        case 1:
            console.trace(arguments[0]);
            break;
        default:
            console.group("log"+logcount+" : '%s'", arguments[0]);
            for (var i = 1; i < arguments.length; i++)
            {
                console.trace(arguments[i]);
            }
            console.groupEnd();
    }
}

window.logif = function ()
{
    logcount++;
    switch(arguments.length)
    {
        case 0:
            console.trace(logcount);
            break;
        case 1:
            console.trace(arguments[0]);
            break;
        default:
            if(arguments[1] == arguments[0])
            {
                console.group("log"+logcount+" : '%s'", arguments[1]);
                for (var i = 1; i < arguments.length; i++)
                {
                    console.trace(arguments[i]);
                }
                console.groupEnd();
            }
    }
}

window.error = function ()
{
    errorcount++;
    switch(arguments.length)
    {
        case 0:
            console.error(errorcount);
            break;
        case 1:
            console.error(arguments[0]);
            break;
        default:
            console.group("error"+errorcount+" : '%s'", arguments[0]);
            for (var i = 1; i < arguments.length; i++)
            {
                console.error(arguments[i]);
            }
            console.groupEnd();
    }
}

window.info = function ()
{
    infocount++;
    switch(arguments.length)
    {
        case 0:
            console.info(infocount);
            break;
        case 1:
            console.info(arguments[0]);
            break;
        default:
            console.group("info"+infocount+" : '%s'", arguments[0]);
            for (var i = 1; i < arguments.length; i++)
            {
                console.info(arguments[i]);
            }
            console.groupEnd();
    }
}

window.warn = function ()
{
    warncount++;
    switch(arguments.length)
    {
        case 0:
            console.warn(warncount);
            break;
        case 1:
            console.warn(arguments[0]);
            break;
        default:
            console.group("warn"+warncount+" : '%s'", arguments[0]);
            for (var i = 1; i < arguments.length; i++)
            {
                console.warn(arguments[i]);
            }
            console.groupEnd();
    }
}

},{}]},{},[24]);
