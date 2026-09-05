import { memo } from 'react'
import { ConfirmModal } from './ConfirmModal/index.js'
import { AddContactModal } from './AddContactModal/index.js'
import { EditContactModal } from './EditContactModal/index.js'
import { DeleteContactModal } from './DeleteContactModal/index.js'

import { GasSettingModal } from './GasSettingModal/index.js'
import { ChooseTokenModal } from './ChooseToken/index.js'

import * as modals from './modal-controls.js'
import { ConfirmDialog, ConfirmDialogComponent } from '@masknet/shared'

export const Modals = memo(function Modals() {
    return (
        <>
            <ConfirmModal ref={modals.ConfirmModal.register} />
            <ConfirmDialogComponent ref={ConfirmDialog.register} />
            <AddContactModal ref={modals.AddContactModal.register} />
            <EditContactModal ref={modals.EditContactModal.register} />
            <DeleteContactModal ref={modals.DeleteContactModal.register} />
            <GasSettingModal ref={modals.GasSettingModal.register} />
            <ChooseTokenModal ref={modals.ChooseTokenModal.register} />
        </>
    )
})
