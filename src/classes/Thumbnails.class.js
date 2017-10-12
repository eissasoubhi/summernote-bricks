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
