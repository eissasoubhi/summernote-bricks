global.SimpleBehavior = class SimpleBehavior extends Behavior
{
    constructor(behavior_type, plugin)
    {
        super(behavior_type, plugin);
    }

    onBtnClick(plugin)
    {
        this.insertPluginContentToEditor()
    }
}
