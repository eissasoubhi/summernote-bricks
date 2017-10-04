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
