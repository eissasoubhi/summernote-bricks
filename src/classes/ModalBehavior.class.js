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
