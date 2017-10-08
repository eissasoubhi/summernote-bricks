global.<%= class_name %> = class <%= class_name %> extends SnBtnPlugin
{
    constructor()
    {
        super('<%= name %>', 'sn_button', 'btn-block', {}, 'simple');
    }

    defineOuterEvents()
    {
        var me = this;
        var parent_events = super.defineOuterEvents();
        me.onBtnClick  = function ()
        {
            parent_events.onBtnClick();
            me.behavior.onBtnClick(me);
        }
    }

}
