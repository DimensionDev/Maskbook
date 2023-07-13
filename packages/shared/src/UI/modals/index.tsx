import { memo } from 'react'
import { NetworkPluginID } from '@masknet/shared-base'
import { WalletStatusModal } from './WalletStatusModal/index.js'
import { SelectProviderModal } from './SelectProviderModal/index.js'
import { WalletConnectQRCodeModal } from './WalletConnectQRCodeModal/index.js'
import { WalletRiskWarningModal } from './WalletRiskWarningModal/index.js'
import { ConnectWalletModal } from './ConnectWalletModal/index.js'
import { LeavePageConfirmModal } from './LeavePageConfirmModal/index.js'
import { ApplicationBoardModal } from './ApplicationBoardModal/index.js'
import { GasSettingModal } from './GasSettingModal/index.js'
import { TransactionSnackbarModal } from './TransactionSnackbar/index.js'
import { ConfirmModal } from './ConfirmModal/index.js'
import { TransactionConfirmModal } from './TokenTransactionConfirmModal/index.js'
import { SelectNonFungibleContractModal } from './SelectNonFungibleContractModal/index.js'
import { SelectFungibleTokenModal } from './SelectFungibleTokenModal/index.js'
import { SelectGasSettingsModal } from './SelectAdvancedSettingsDialog/index.js'
import { AddCollectiblesModal } from './AddCollectiblesModal/index.js'
import { PersonaSelectPanelModal } from './PersonaSelectPanelModal/index.js'

import * as modals from './modals.js'
export * from './modals.js'

export const Modals = memo(function Modals() {
    return (
        <>
            <ConnectWalletModal ref={modals.ConnectWalletModal.register} />
            <WalletConnectQRCodeModal ref={modals.WalletConnectQRCodeModal.register} />
            <SelectProviderModal ref={modals.SelectProviderModal.register} />
            <WalletStatusModal ref={modals.WalletStatusModal.register} />
            <WalletRiskWarningModal ref={modals.WalletRiskWarningModal.register} />
            <LeavePageConfirmModal ref={modals.LeavePageConfirmModal.register} />
            <ApplicationBoardModal ref={modals.ApplicationBoardModal.register} />
            <GasSettingModal ref={modals.GasSettingModal.register} />
            <TransactionSnackbarModal pluginID={NetworkPluginID.PLUGIN_EVM} ref={modals.TransactionSnackbar.register} />
            <TransactionConfirmModal ref={modals.TransactionConfirmModal.register} />
            <ConfirmModal ref={modals.ConfirmModal.register} />
            <SelectNonFungibleContractModal ref={modals.SelectNonFungibleContractModal.register} />
            <SelectFungibleTokenModal ref={modals.SelectFungibleTokenModal.register} />
            <SelectGasSettingsModal ref={modals.SelectGasSettingsModal.register} />
            <AddCollectiblesModal ref={modals.AddCollectiblesModal.register} />
            <PersonaSelectPanelModal ref={modals.PersonaSelectPanelModal.register} />
        </>
    )
})
