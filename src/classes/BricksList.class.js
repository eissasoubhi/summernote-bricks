global.BricksList = class BricksList extends SnDropdownPlugin
{
    constructor(dropdown_content)
    {
        super('bricks', 'sn_dropdown', 'dropdown-toggle',{toggle: 'dropdown'}, dropdown_content, 'no_behavior');
    }


}
