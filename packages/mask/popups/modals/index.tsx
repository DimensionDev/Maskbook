import { memo } from 'react'
import { ConfirmModal } from './ConfirmModal/index.js'
import { AddContactModal } from './AddContactModal/index.js'
import { EditContactModal } from './EditContactModal/index.js'
import { DeleteContactModal } from './DeleteContactModal/index.js'
import { WalletRenameModal } from './WalletRenameModal/index.js'
import { WalletRemoveModal } from './WalletRemoveModal/index.js'
import { WalletAutoLockSettingModal } from './WalletAutoLockSettingModal/index.js'
import { ChangePaymentPasswordModal } from './ChangePaymentPasswordModal/index.js'
import { ShowPrivateKeyModal } from './ShowPrivateKeyModal/index.js'

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
            <WalletRenameModal ref={modals.WalletRenameModal.register} />
            <WalletRemoveModal ref={modals.WalletRemoveModal.register} />
            <WalletAutoLockSettingModal ref={modals.WalletAutoLockSettingModal.register} />
            <GasSettingModal ref={modals.GasSettingModal.register} />
            <ChangePaymentPasswordModal ref={modals.ChangePaymentPasswordModal.register} />
            <ShowPrivateKeyModal ref={modals.ShowPrivateKeyModal.register} />
            <ChooseTokenModal ref={modals.ChooseTokenModal.register} />
        </>
    )
})
