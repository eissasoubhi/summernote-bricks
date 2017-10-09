global.<%= class_name %>  = class <%= class_name %>  extends SnBtnPlugin
{
    constructor()
    {
        super('<%= name %>', 'sn_button', 'btn-block', {}, 'modal');
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
        modal.refresh_on_open = true;
    }

    setPropertiesToModal(modal)
    {
        var $modal = modal.modal;
        $modal.find('.modal-title').html(modal.modal_title);
        $modal.find('#add-item').html(modal.modal_content_add_item);
    }

    setModalContentHtml(modal)
    {
        this.initProperties(modal);
    }

    setModalContentEvents()
    {

    }

    getFinalContent()
    {
        var $modal = this.behavior.modal.modal;
        var $html = $(this.html);
        var content = $html.find('.content');
        var something = $modal.find('.something').text();

        content.text(content.text() + something)
        /*
            do some logic here
        */

        return $html.prop('outerHTML'); ;
    }

    saveModalEvent()
    {
        var modal = this.behavior.modal;

        modal.setEvent("add", $.proxy(function(plugin) {
            var plugin_content = plugin.getFinalContent();

            plugin.behavior.insertToEditor(plugin_content);
        }, null, this))
    }
}
