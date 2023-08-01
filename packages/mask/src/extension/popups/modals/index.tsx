import { memo } from 'react'
import { DisconnectModal } from './DisconnectModal/index.js'
import { ConfirmModal } from './ConfirmModal/index.js'
import { AddContactModal } from './AddContactModal/index.js'
import { EditContactModal } from './EditContactModal/index.js'
import { DeleteContactModal } from './DeleteContactModal/index.js'
import { GasSettingModal } from './GasSettingModal/index.js'
import { ChooseTokenModal } from './ChooseToken/index.js'

import * as modals from './modals.js'
export * from './modals.js'

export const Modals = memo(function Modals() {
    return (
        <>
            <DisconnectModal ref={modals.DisconnectModal.register} />
            <ConfirmModal ref={modals.ConfirmModal.register} />
            <AddContactModal ref={modals.AddContactModal.register} />
            <EditContactModal ref={modals.EditContactModal.register} />
            <DeleteContactModal ref={modals.DeleteContactModal.register} />
            <GasSettingModal ref={modals.GasSettingModal.register} />
            <ChooseTokenModal ref={modals.ChooseTokenModal.register} />
        </>
    )
})
