global.ContactForm = class ContactForm extends SnBtnPlugin
{
    constructor()
    {
        super('contact_form', 'sn_button', 'btn-block', {}, 'simple');
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
    // initAttributes()
    // {
    //     super.initAttributes();
    //     this.removeFromExcludedContentsFiles(['script']);
    // }
}
