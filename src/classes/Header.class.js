global.Header = class Header extends SnBtnPlugin
{
    constructor()
    {
        super('header', 'sn_button', 'btn-block', {}, 'simple');
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
