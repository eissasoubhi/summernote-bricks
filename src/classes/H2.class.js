global.H2 = class H2 extends SnBtnPlugin
{
    constructor()
    {
        super('h2', 'sn_button', 'btn-block', {}, 'simple');
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
