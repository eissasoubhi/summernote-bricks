global.SnBtnPlugin = class SnBtnPlugin extends SnPlugin{
    renderControl()
    {
        var me = this;
        return me.renderButton();
    }

    renderButton()
    {
        var me = this;
        var button = me.createButton();
        return button.render();
    }

}