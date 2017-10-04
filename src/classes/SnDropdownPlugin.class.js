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