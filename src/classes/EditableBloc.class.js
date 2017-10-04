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
