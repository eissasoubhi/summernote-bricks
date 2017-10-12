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
