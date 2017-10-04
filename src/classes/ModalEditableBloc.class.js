global.ModalEditableBloc = class ModalEditableBloc extends EditableBloc
{
    constructor(editable_bloc_type, plugin, content)
    {
        super(editable_bloc_type, plugin, content);
    }

    initActionsButtons()
    {
        super.initActionsButtons()
        this.modal_edit_btn = '<button type="button" class="modal-edit btn btn-primary"><i class="fa fa-edit"></i></button>';
    }

    setEvents()
    {
        super.setEvents()
        $(this.plugin.editor.editable_div).on('click', '#'+ this.content_identifier +' .bloc-action-btns button.modal-edit', {editable_bloc : this}, this.onContentModalEdit)
    }

    onContentModalEdit(event)
    {
        var editable_bloc = event.data.editable_bloc
        $.proxy(editable_bloc.editContentInModal, this, event.data.editable_bloc)();
    }

    editContentInModal(editable_bloc)
    {
        editable_bloc.clickValidateButton();
        editable_bloc.plugin.behavior.modal.openToEdit(editable_bloc);
        editable_bloc.plugin.addEditableContentEvent('edited', $.proxy(function () {
            var editable_bloc = this;
            editable_bloc.updateActionsButtons();
        }, editable_bloc))
    }
}
