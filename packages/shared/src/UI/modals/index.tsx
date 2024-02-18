import { memo } from 'react'
import { NetworkPluginID } from '@masknet/shared-base'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { WalletStatusModal } from './WalletStatusModal/index.js'
import { SelectProviderModal } from './SelectProviderModal/index.js'
import { WalletConnectQRCodeModal } from './WalletConnectQRCodeModal/index.js'
import { WalletRiskWarningModal } from './WalletRiskWarningModal/index.js'
import { ConnectWalletModal } from './ConnectWalletModal/index.js'
import { LeavePageConfirmModal } from './LeavePageConfirmModal/index.js'
import { ApplicationBoardModal, ApplicationBoardSettingsModal } from './ApplicationBoardModal/index.js'
import { GasSettingModal } from './GasSettingModal/index.js'
import { TransactionSnackbarModal } from './TransactionSnackbar/index.js'
import { ConfirmModal } from './ConfirmModal/index.js'
import { TransactionConfirmModal } from './TokenTransactionConfirmModal/index.js'
import { SelectNonFungibleContractModal } from './SelectNonFungibleContractModal/index.js'
import { SelectFungibleTokenModal } from './SelectFungibleTokenModal/index.js'
import { SelectGasSettingsModal } from './SelectAdvancedSettingsDialog/index.js'
import { AddCollectiblesModal } from './AddCollectiblesModal/index.js'
import { PersonaSelectPanelModal } from './PersonaSelectPanelModal/index.js'

import { noop } from 'lodash-es'
import * as modals from './modals.js'
import { ConfirmDialogComponent } from './ConfirmDialog/index.js'
export * from './modals.js'

export interface ModalProps {
    createWallet(): void
}
export const Modals = memo(function Modals(props: ModalProps) {
    return (
        <RootWeb3ContextProvider>
            <ConnectWalletModal ref={modals.ConnectWalletModal.register} />
            <WalletConnectQRCodeModal ref={modals.WalletConnectQRCodeModal.register} />
            <ConfirmDialogComponent ref={modals.ConfirmDialog.register} />
            <SelectProviderModal createWallet={props.createWallet} ref={modals.SelectProviderModal.register} />
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
            <ApplicationBoardSettingsModal ref={modals.ApplicationBoardSettingsModal.register} />
        </RootWeb3ContextProvider>
    )
})

export const SwapPageModals = memo(function SwapPageModals() {
    return (
        <>
            <ConnectWalletModal ref={modals.ConnectWalletModal.register} />
            <SelectProviderModal createWallet={noop} ref={modals.SelectProviderModal.register} />
            <WalletRiskWarningModal ref={modals.WalletRiskWarningModal.register} />
            <SelectFungibleTokenModal ref={modals.SelectFungibleTokenModal.register} />
            <SelectGasSettingsModal ref={modals.SelectGasSettingsModal.register} />
        </>
    )
})

// Common modals
export { ConfirmDialogComponent } from './ConfirmDialog/index.js'
export { ConfirmDialog } from './modals.js'
