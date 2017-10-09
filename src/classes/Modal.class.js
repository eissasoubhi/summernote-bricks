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
