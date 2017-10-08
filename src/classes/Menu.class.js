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
