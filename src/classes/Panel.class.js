global.Panel = class Panel extends SnBtnPlugin
{
    constructor()
    {
        super('panel', 'sn_button', 'btn-block', {}, 'simple');
    }

    defineOuterEvents()
    {
        var me = this;
        super.defineOuterEvents();
        me.onBtnClick  = function ()
        {
            me.behavior.onBtnClick(me);
        }
    }

}
