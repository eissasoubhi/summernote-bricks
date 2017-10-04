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
